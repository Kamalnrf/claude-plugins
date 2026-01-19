import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { note, spinner, multiselect, isCancel } from "@clack/prompts";
import pc from "picocolors";
import type { InstallOptions } from "../types.js";
import { getClientConfig, getAvailableClients } from "../lib/client-config.js";
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

/**
 * Validate client config and show scope warnings
 * Returns validated config and scope
 */
function validateClientAndScope(options: InstallOptions) {
	const config = getClientConfig(options.client);
	if (!config) {
		const available = getAvailableClients().join(", ");
		throw new Error(`Unknown client: ${options.client}\nAvailable: ${available}`);
	}

	const scope = options.local ? "local" : "global";

	if (scope === "global" && !config.globalDir) {
		note(
			`Client "${config.name}" does not support global installation.\nInstalling to project directory instead.`,
		);
	}

	return { config, scope };
}

/**
 * Install a single skill given its resolved metadata
 */
async function installSingleSkill(
	skill: ResolvedSkill,
	options: InstallOptions,
): Promise<{ name: string; installed: boolean; updated: boolean }> {
	const s = spinner();
	const config = getClientConfig(options.client)!;
	const scope = options.local ? "local" : "global";

	const installPath = getSkillPath(config, scope, skill.name);
	const isUpdate = existsSync(installPath);

	if (isUpdate) {
		note(
			`Existing installation found at ${pc.dim(installPath)}\n${pc.yellow("⚠")} This will be overwritten.`,
			"Updating",
		);
	}

	// Ensure directory exists
	const baseDir = getInstallDir(config, scope);
	await ensureDirectoryExists(baseDir);

	// Download skill
	s.start(`Installing ${skill.name}...`);
	await downloadSkill(skill.sourceUrl, installPath);

	// Validate
	const isValid = await validateSkillMd(installPath);
	if (!isValid) {
		await rm(installPath, { recursive: true, force: true });
		s.stop(`Failed: ${skill.name}`);
		throw new Error(`Invalid skill: ${skill.name} - missing or empty SKILL.md`);
	}

	s.stop(`${isUpdate ? "Updated" : "Installed"} ${skill.name}`);

	// Track installation (fire-and-forget)
	trackInstallation(skill.namespace);

	return { name: skill.name, installed: !isUpdate, updated: isUpdate };
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

	// Validate client config upfront
	const { config } = validateClientAndScope(options);

	// Resolve skills using unified API
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

	// Determine which skills to install
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

	// Install each selected skill
	const installed: string[] = [];
	const updated: string[] = [];

	for (const skill of toInstall) {
		try {
			const result = await installSingleSkill(skill, options);
			if (result.updated) {
				updated.push(result.name);
			} else {
				installed.push(result.name);
			}
		} catch (error) {
			note(
				`Failed to install ${skill.name}: ${error instanceof Error ? error.message : String(error)}`,
				"Error",
			);
		}
	}

	// Success message
	if (installed.length > 0 || updated.length > 0) {
		const parts: string[] = [];
		if (installed.length > 0) {
			parts.push(`${pc.green("✓")} Installed: ${installed.join(", ")}`);
		}
		if (updated.length > 0) {
			parts.push(`${pc.green("✓")} Updated: ${updated.join(", ")}`);
		}

		const scopeMsg = !options.local
			? `Available for all ${config.name} projects.`
			: "Available for this project only.";

		note(parts.join("\n") + `\n\n${scopeMsg}`, "Complete");
	}
}
