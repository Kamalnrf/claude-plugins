import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import pc from "picocolors";
import type { ListOptions, ClientConfig } from "../types.js";
import {
	getClientConfig,
	CLIENT_CONFIGS,
} from "../lib/client-config.js";

interface InstalledSkill {
	skill: string;
	client: string;
	scope: "global" | "local";
	path: string;
}

/**
 * Scan a directory for installed skills
 */
const scanSkillsDir = async (
	dir: string,
	client: string,
	scope: "global" | "local",
): Promise<InstalledSkill[]> => {
	if (!existsSync(dir)) {
		return [];
	}

	try {
		const entries = await readdir(dir);
		return entries.map((skill) => ({
			skill,
			client,
			scope,
			path: `${dir}/${skill}`,
		}));
	} catch {
		return [];
	}
};

/**
 * Get all installed skills for a client
 */
const getClientSkills = async (
	config: ClientConfig,
): Promise<InstalledSkill[]> => {
	const scans = [scanSkillsDir(config.localDir, config.name, "local")];

	// Only scan global if supported
	if (config.globalDir) {
		scans.push(scanSkillsDir(config.globalDir, config.name, "global"));
	}

	const results = await Promise.all(scans);
	return results.flat();
};

/**
 * List installed agent skills
 */
export async function list(options: ListOptions): Promise<void> {
	// Get configs to scan
	const configs = options.client
		? [getClientConfig(options.client)]
		: Object.values(CLIENT_CONFIGS);

	if (configs.some((c) => !c)) {
		throw new Error(`Unknown client: ${options.client}`);
	}

	// Scan all clients in parallel
	const results = await Promise.all(
		configs.filter(Boolean).map((c) => getClientSkills(c!)),
	);

	const installedSkills = results.flat();

	if (installedSkills.length === 0) {
		console.log(pc.dim("No skills installed."));
		console.log(
			pc.dim("Visit https://claude-plugins.dev/skills to discover agent skills."),
		);
		return;
	}

	console.log(pc.bold("\nInstalled Agent Skills:\n"));
	for (const { skill, client, scope, path } of installedSkills) {
		console.log(
			`${pc.green("●")} ${pc.bold(skill)} ${pc.dim(`(${client}, ${scope})`)}`,
		);
		console.log(pc.dim(`  ${path}`));
	}
	console.log();
}
