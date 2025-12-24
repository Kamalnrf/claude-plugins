import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import type { ClientConfig, InstallScope } from "../types.js";

export const getInstallDir = (
	config: ClientConfig,
	scope: InstallScope,
): string => (scope === "global" ? config.globalDir : config.localDir);

export const getSkillPath = (
	config: ClientConfig,
	scope: InstallScope,
	skillName: string,
): string => join(getInstallDir(config, scope), skillName);

export const ensureDirectoryExists = async (path: string): Promise<void> => {
	await mkdir(path, { recursive: true });
};
