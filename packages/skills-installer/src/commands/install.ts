import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { note, spinner, multiselect, isCancel } from "@clack/prompts";
import pc from "picocolors";
import type { InstallOptions, SkillIdentifier } from "../types.js";
import { getClientConfig, getAvailableClients } from "../lib/client-config.js";
import {
	getSkillPath,
	getInstallDir,
	ensureDirectoryExists,
} from "../lib/paths.js";
import {
	resolveSkill,
	trackInstallation,
	indexRepoAndListSkills,
	type IndexedSkill,
} from "../lib/api.ts";
import { downloadSkill } from "../lib/download.js";
import { validateSkillMd } from "../lib/validate.js";
import { parseInstallTarget } from "../lib/parse-target.js";

/**
 * Core installation logic for a single skill
 * Used by both registry and git flows after resolution
 */
async function installSingleSkill(
	identifier: SkillIdentifier,
	options: InstallOptions,
): Promise<{ name: string; installed: boolean; updated: boolean }> {
	const s = spinner();

	const config = getClientConfig(options.client)!;
	const scope = options.local ? "local" : "global";

	// Resolve skill from registry
	s.start(`Resolving ${identifier.skillName}...`);
	const metadata = await resolveSkill(identifier);

	if (!metadata) {
		s.stop(`Failed to resolve ${identifier.skillName}`);
		throw new Error(`Skill not found: ${identifier.owner}/${identifier.repo}/${identifier.skillName}`);
	}

	// Handle SKILL.md in name edge case
	let skillName = identifier.skillName;
	if (skillName.includes(".md") && metadata.name) {
		skillName = metadata.name.split(" ").join("-");
	}

	const installPath = getSkillPath(config, scope, skillName);
	const isUpdate = existsSync(installPath);

	if (isUpdate) {
		s.stop(`Found existing: ${skillName}`);
		note(
			`Existing installation found at ${pc.dim(installPath)}\n${pc.yellow("⚠")} This will be overwritten.`,
			"Updating",
		);
	} else {
		s.stop(`Resolved: ${skillName}`);
	}

	// Ensure directory exists
	const baseDir = getInstallDir(config, scope);
	await ensureDirectoryExists(baseDir);

	// Download skill
	s.start(`Installing ${skillName}...`);
	await downloadSkill(metadata.sourceUrl, installPath);

	// Validate
	const isValid = await validateSkillMd(installPath);
	if (!isValid) {
		await rm(installPath, { recursive: true, force: true });
		s.stop(`Failed: ${skillName}`);
		throw new Error(`Invalid skill: ${skillName} - missing or empty SKILL.md`);
	}

	s.stop(`${isUpdate ? "Updated" : "Installed"} ${skillName}`);

	// Track installation
	trackInstallation(identifier);

	return { name: skillName, installed: !isUpdate, updated: isUpdate };
}

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
 * Install skills from a Git repository
 * Indexes via registry, then uses same install flow as registry installs
 */
async function installFromGitRepo(
	skillId: string,
	options: InstallOptions,
	subdir?: string,
): Promise<void> {
	const s = spinner();
	const target = parseInstallTarget(skillId);

	if (target.kind === "registry-skill") {
		throw new Error("Expected git target");
	}

	const { repo } = target;
	const repoSlug = `${repo.owner}/${repo.repo}`;

	// Validate client config upfront
	const { config } = validateClientAndScope(options);

	// Index repo via registry and get available skills
	s.start(`Indexing ${pc.cyan(repoSlug)}...`);

	let indexResult;
	try {
		indexResult = await indexRepoAndListSkills(repoSlug);
	} catch (error) {
		s.stop("Failed to index repository");
		throw error;
	}

	// Filter to only valid skills
	const validSkills = (indexResult.result?.skills ?? []).filter(
		(sk) => sk.status === "indexed" || sk.status === "unchanged",
	);

	s.stop(`Found ${validSkills.length} skill${validSkills.length !== 1 ? "s" : ""}`);

	if (validSkills.length === 0) {
		note(
			`No valid skills found in ${pc.cyan(repoSlug)}.\n\n` +
				`A skill requires a valid ${pc.bold("SKILL.md")} file.`,
			"No Skills Found",
		);
		return;
	}

	// Determine which skills to install
	let toInstall: IndexedSkill[];

	if (subdir) {
		// Direct path: find matching skill
		const normalizedSubdir = subdir.replace(/^\.\//, "").replace(/\/$/, "");
		const skill = validSkills.find((sk) => {
			const normalizedRelDir = sk.relDir.replace(/^\.\//, "").replace(/\/$/, "");
			return (
				normalizedRelDir === normalizedSubdir ||
				normalizedRelDir.endsWith(`/${normalizedSubdir}`) ||
				normalizedSubdir.endsWith(normalizedRelDir)
			);
		});

		if (!skill) {
			note(
				`Skill not found at path: ${pc.cyan(subdir)}\n\n` +
					`Available skills:\n` +
					validSkills.map((sk) => `  • ${sk.name} (${sk.relDir})`).join("\n"),
				"Not Found",
			);
			throw new Error(`Skill not found at path: ${subdir}`);
		}
		toInstall = [skill];
	} else if (validSkills.length === 1) {
		toInstall = validSkills;
		note(`Found: ${pc.bold(validSkills[0]!.name)}`);
	} else {
		const selected = await multiselect({
			message: `Select skills to install:`,
			options: validSkills.map((skill) => ({
				value: skill.skillName,
				label: skill.name,
				hint: skill.relDir === "." ? "root" : skill.relDir,
			})),
			required: true,
		});

		if (isCancel(selected)) {
			note("Installation cancelled.");
			return;
		}

		toInstall = validSkills.filter((sk) =>
			(selected as string[]).includes(sk.skillName),
		);
	}

	// Install each selected skill using the shared flow
	const installed: string[] = [];
	const updated: string[] = [];

	for (const skill of toInstall) {
		const identifier: SkillIdentifier = {
			owner: `@${repo.owner}`,
			repo: repo.repo,
			skillName: skill.skillName,
		};

		try {
			const result = await installSingleSkill(identifier, options);
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

/**
 * Install a skill from the registry by identifier
 */
async function installFromRegistry(
	skillId: string,
	options: InstallOptions,
): Promise<void> {
	const target = parseInstallTarget(skillId);

	if (target.kind !== "registry-skill") {
		throw new Error("Expected registry target");
	}

	// Validate client config
	const { config } = validateClientAndScope(options);

	// Install using shared flow
	const result = await installSingleSkill(target.identifier, options);

	const scopeMsg = !options.local
		? `Available for all ${config.name} projects.`
		: "Available for this project only.";

	note(
		`${pc.green("✓")} Skill "${result.name}" ${result.updated ? "updated" : "installed"}!\n\n${scopeMsg}`,
		result.updated ? "Update Complete" : "Installation Complete",
	);
}

/**
 * Install an agent skill
 * Supports both registry identifiers and Git URLs
 */
export async function install(
	skillId: string,
	options: InstallOptions,
): Promise<void> {
	const target = parseInstallTarget(skillId);

	switch (target.kind) {
		case "registry-skill":
			await installFromRegistry(skillId, options);
			break;

		case "git-repo":
			await installFromGitRepo(skillId, options);
			break;

		case "git-skill-path":
			await installFromGitRepo(skillId, options, target.subdir);
			break;
	}
}
