import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { intro, note, outro } from "@clack/prompts";
import pc from "picocolors";
import type { ListOptions, ClientConfig } from "../types";
import { getClientConfig, CLIENT_CONFIGS } from "../lib/client-config";

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
	intro(pc.cyan("Skills Installer"));

	const configs = options.client
		? [getClientConfig(options.client)]
		: Object.values(CLIENT_CONFIGS);

	if (configs.some((c) => !c)) {
		throw new Error(`Unknown client: ${options.client}`);
	}

	const results = await Promise.all(
		configs.filter(Boolean).map((c) => getClientSkills(c!)),
	);

	const installedSkills = results.flat();

	if (installedSkills.length === 0) {
		note(
			"Visit https://claude-plugins.dev/skills to discover agent skills.",
			"No skills installed",
		);
		outro("Done");
		return;
	}

	// Group by client
	const grouped = installedSkills.reduce(
		(acc, skill) => {
			if (!acc[skill.client]) {
				acc[skill.client] = [];
			}
			acc[skill.client].push(skill);
			return acc;
		},
		{} as Record<string, InstalledSkill[]>,
	);

	const entries = Object.entries(grouped);
	let output = "";
	entries.forEach(([client, skills], idx) => {
		output += `${pc.dim(client)}:\n`;
		for (const { skill, scope } of skills) {
			const icon = scope === "global" ? "🌐" : "📁";
			output += `  ${icon} ${skill}\n`;
		}
		if (idx < entries.length - 1) output += "\n";
	});

	note(output.trim(), "Installed Skills");

	console.log(pc.dim("\n  🌐 global  📁 project\n"));
}
