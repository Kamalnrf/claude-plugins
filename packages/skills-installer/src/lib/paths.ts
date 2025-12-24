import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import type { ClientConfig, InstallScope } from "../types.js";

export const getInstallDir = (
	config: ClientConfig,
	scope: InstallScope,
): string => {
	if (scope === "global" && !config.globalDir) {
		// Fallback to local for clients that don't support global
		return config.localDir;
	}
	return scope === "global" ? config.globalDir! : config.localDir;
};

export const getSkillPath = (
	config: ClientConfig,
	scope: InstallScope,
	skillName: string,
): string => join(getInstallDir(config, scope), skillName);

export const ensureDirectoryExists = async (path: string): Promise<void> => {
	await mkdir(path, { recursive: true });
};
