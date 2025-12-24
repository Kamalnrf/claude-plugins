import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { note, spinner } from "@clack/prompts";
import pc from "picocolors";
import type { InstallOptions } from "../types.js";
import { getClientConfig, getAvailableClients } from "../lib/client-config.js";
import { getSkillPath, getInstallDir, ensureDirectoryExists } from "../lib/paths.js";
import {
	parseSkillIdentifier,
	resolveSkill,
	trackInstallation,
} from "../lib/api.js";
import { downloadSkill } from "../lib/download.js";
import { validateSkillMd } from "../lib/validate.js";

/**
 * Install an agent skill
 * Functional composition of pure functions and side effects
 */
export async function install(
	skillId: string,
	options: InstallOptions,
): Promise<void> {
	const s = spinner();

	// 1. Parse skill identifier
	const identifier = parseSkillIdentifier(skillId);

	// 2. Get client config (data lookup)
	const config = getClientConfig(options.client);
	if (!config) {
		const available = getAvailableClients().join(", ");
		throw new Error(`Unknown client: ${options.client}\nAvailable: ${available}`);
	}

	// 3. Determine paths (pure functions)
	const scope = options.local ? "local" : "global";
	const installPath = getSkillPath(config, scope, identifier.skillName);

	// 4. Check for existing installation
	const isUpdate = existsSync(installPath);
	if (isUpdate) {
		note(
			`Existing installation found at ${pc.dim(installPath)}\n${pc.yellow("⚠")} This will be overwritten with the latest version.`,
			"Updating Skill",
		);
	}

	// 5. Resolve skill from registry
	s.start("Resolving skill from registry...");
	const metadata = await resolveSkill(identifier);

	if (!metadata) {
		s.stop("Failed to resolve");
		note(
			`Skill ${pc.cyan(skillId)} not found in the registry.\n\nVisit ${pc.blue(pc.underline("https://claude-plugins.dev/skills"))} to discover available skills.`,
			"Not Found",
		);
		throw new Error(`Unable to resolve "${skillId}"`);
	}

	s.stop(`Resolved: ${identifier.skillName} ${pc.gray(`(${metadata.sourceUrl})`)}`);

	// 6. Show installation path
	note(`Installing to: ${pc.dim(installPath)}`);

	// 7. Ensure directory exists
	const baseDir = getInstallDir(config, scope);
	await ensureDirectoryExists(baseDir);

	// 8. Download skill
	s.start(`Installing ${identifier.skillName}...`);
	await downloadSkill(metadata.sourceUrl, installPath);

	// 9. Validate installation
	const isValid = await validateSkillMd(installPath);
	if (!isValid) {
		await rm(installPath, { recursive: true, force: true });
		s.stop("Installation failed");
		throw new Error("Invalid skill: missing or empty SKILL.md");
	}

	s.stop(`Skill cloned to ${installPath}`);

	// 10. Track installation (fire-and-forget)
	trackInstallation(identifier);

	// 11. Success message
	const action = isUpdate ? "updated" : "installed";
	const title = isUpdate ? "Update Complete" : "Installation Complete";
	note(
		`${pc.green("✓")} Skill "${identifier.skillName}" ${action} successfully!\n\n${!options.local ? `Available for all ${config.name} projects.` : "Available for this project only."}`,
		title,
	);
}
