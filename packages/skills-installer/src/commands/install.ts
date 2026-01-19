import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { note, spinner, multiselect, isCancel, outro } from "@clack/prompts";
import pc from "picocolors";
import type { InstallOptions } from "../types.js";
import { getClientConfig } from "../lib/client-config.js";
import {
	getSkillPath,
	getInstallDir,
	ensureDirectoryExists,
} from "../lib/paths.js";
import {
	resolveTarget,
	trackInstallation,
	type ResolvedSkill,
} from "../lib/api.js";
import { downloadSkill } from "../lib/download.js";
import { validateSkillMd } from "../lib/validate.js";
import { selectScopeAndClients } from "../lib/select-scope-and-clients.js";

/**
 * Fun success messages for install completion
 */
const SUCCESS_MESSAGES = [
	{ emoji: "🚀", text: "Skills locked and loaded!" },
	{ emoji: "✨", text: "Your agent just leveled up!" },
	{ emoji: "🎯", text: "New abilities unlocked!" },
	{ emoji: "⚡", text: "Supercharged and ready to go!" },
	{ emoji: "🌟", text: "Skills successfully acquired!" },
	{ emoji: "🔮", text: "Magic powers installed!" },
	{ emoji: "🎪", text: "New tricks in the bag!" },
	{ emoji: "🏆", text: "Achievement unlocked: Skill Master!" },
];

const getRandomSuccessMessage = () => {
	const idx = Math.floor(Math.random() * SUCCESS_MESSAGES.length);
	return SUCCESS_MESSAGES[idx]!;
};

/**
 * Show a friendly exit message with ASCII art
 */
const showExitMessage = (): void => {
	const moonArt = pc.yellow(
		`    *  .  *
       .    *    .
   *   .        .       *
     .    *  .     . *
   .  *        *  .    .`,
	);

	const { emoji, text } = getRandomSuccessMessage();

	const message =
		`${moonArt}\n\n` +
		`${emoji} ${pc.bold(text)}\n\n` +
		`To find plugins and browse skills on the web, see:\n` +
		`${pc.blue(pc.underline("https://claude-plugins.dev"))}\n\n` +
		`To share ideas and issues, come visit us on the Moon:\n` +
		`${pc.magenta(pc.underline("https://discord.gg/Pt9uN4FXR4"))}\n\n` +
		`${pc.dim("This project is open-source and we'd love to hear from you!")}`;

	outro(message);
};



/**
 * Install a single skill to a single client (no logging)
 */
async function installSkillToClient(
	skill: ResolvedSkill,
	clientId: string,
	local: boolean,
): Promise<{ updated: boolean }> {
	const config = getClientConfig(clientId);
	if (!config) {
		throw new Error(`Unknown client: "${clientId}". Use a valid client ID.`);
	}
	const scope = local ? "local" : "global";

	const installPath = getSkillPath(config, scope, skill.name);
	const isUpdate = existsSync(installPath);

	// Ensure directory exists
	const baseDir = getInstallDir(config, scope);
	await ensureDirectoryExists(baseDir);

	// Download skill
	await downloadSkill(skill.sourceUrl, installPath);

	// Validate
	const isValid = await validateSkillMd(installPath);
	if (!isValid) {
		await rm(installPath, { recursive: true, force: true });
		throw new Error(`Invalid skill: ${skill.name} - missing or empty SKILL.md`);
	}

	return { updated: isUpdate };
}

/**
 * Install a single skill to all selected clients
 */
async function installSingleSkill(
	skill: ResolvedSkill,
	clientIds: string[],
	local: boolean,
): Promise<{ name: string; installed: string[]; updated: string[]; failed: string[] }> {
	const s = spinner();
	const clientNames = clientIds.map((id) => {
		const config = getClientConfig(id);
		if (!config) {
			throw new Error(`Unknown client: "${id}". Use a valid client ID.`);
		}
		return config.name;
	});

	s.start(`Installing ${skill.name} to ${clientNames.join(", ")}...`);

	const installed: string[] = [];
	const updated: string[] = [];
	const failed: string[] = [];

	for (const clientId of clientIds) {
		try {
			const result = await installSkillToClient(skill, clientId, local);
			const config = getClientConfig(clientId)!;
			if (result.updated) {
				updated.push(config.name);
			} else {
				installed.push(config.name);
			}
		} catch {
			failed.push(getClientConfig(clientId)!.name);
		}
	}

	if (failed.length === clientIds.length) {
		s.stop(`Failed: ${skill.name}`);
	} else {
		s.stop(`Installed ${skill.name}`);
		// Track installation only on success (fire-and-forget)
		trackInstallation(skill.namespace);
	}

	return { name: skill.name, installed, updated, failed };
}

/**
 * Install an agent skill
 * Supports: @owner/repo/skill, owner/repo, owner/repo/skill, GitHub URLs
 */
export async function install(
	skillId: string,
	options: InstallOptions,
): Promise<void> {
	const s = spinner();

	// 1. Resolve skills first
	s.start(`Resolving ${pc.cyan(skillId)}...`);

	let response;
	try {
		response = await resolveTarget(skillId);
	} catch (error) {
		s.stop("Failed to resolve");
		throw error;
	}

	const skills = response.skills;

	if (skills.length === 0) {
		s.stop("No skills found");
		note(
			`No skills found for ${pc.cyan(skillId)}.\n\n` +
				`A skill requires a valid ${pc.bold("SKILL.md")} file.`,
			"Not Found",
		);
		return;
	}

	s.stop(`Found ${skills.length} skill${skills.length !== 1 ? "s" : ""}`);

	// 2. Determine which skills to install
	let toInstall: ResolvedSkill[];

	if (skills.length === 1) {
		toInstall = skills;
		note(`Found: ${pc.bold(skills[0]!.name)}`);
	} else {
		// Multiple skills - show multiselect
		const selected = await multiselect({
			message: "Select skills to install:",
			options: skills.map((skill) => ({
				value: skill.namespace,
				label: skill.name,
				hint: skill.relDir === "." ? "root" : skill.relDir,
			})),
			required: true,
		});

		if (isCancel(selected)) {
			note("Installation cancelled.");
			return;
		}

		toInstall = skills.filter((sk) =>
			(selected as string[]).includes(sk.namespace),
		);
	}

	// 3. Determine scope and clients
	let clientIds: string[];
	let local: boolean;

	// If clients array is provided directly (e.g., from search), use it
	if (options.clients && options.clients.length > 0) {
		clientIds = options.clients;
		local = options.local ?? false;
	} else {
		// Otherwise, prompt for scope and clients
		const scopeAndClients = await selectScopeAndClients({
			client: options.client,
			local: options.local,
		});

		if (!scopeAndClients || scopeAndClients === "back") {
			note("Installation cancelled.");
			return;
		}

		clientIds = scopeAndClients.clientIds;
		local = scopeAndClients.scope === "local";
	}

	// 5. Install each skill to all selected clients
	const results: Array<{ name: string; installed: string[]; updated: string[]; failed: string[] }> = [];

	for (const skill of toInstall) {
		const result = await installSingleSkill(skill, clientIds, local);
		results.push(result);
	}

	// Success message
	const successful = results.filter((r) => r.installed.length > 0 || r.updated.length > 0);
	if (successful.length > 0) {
		const clientNames = clientIds.map((id) => {
			const config = getClientConfig(id);
			if (!config) {
				throw new Error(`Unknown client: "${id}". Use a valid client ID.`);
			}
			return config.name;
		});
		const skillNames = successful.map((r) => r.name);

		const scopeMsg = local
			? pc.dim("Available for this project only.")
			: pc.dim("Available globally.");

		const summary =
			`${pc.green("✓")} ${pc.bold("Skills:")} ${skillNames.join(", ")}\n` +
			`${pc.green("✓")} ${pc.bold("Clients:")} ${clientNames.join(", ")}\n\n` +
			scopeMsg;

		note(summary, "Complete");
		showExitMessage();
	}
}
