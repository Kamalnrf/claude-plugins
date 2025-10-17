import type { Config } from "./types";
import { CONFIG_FILE, exists, readJSON, writeJSON } from "./utils/fs";

const DEFAULT_CONFIG: Config = {
	defaultMarketplace: "claude-plugin-marketplace",
	registryUrl: "https://api.claude-plugins.com",
};

/**
 * Gets the CLI configuration, creating default if it doesn't exist
 */
export async function getConfig(): Promise<Config> {
	if (!(await exists(CONFIG_FILE))) {
		await writeJSON(CONFIG_FILE, DEFAULT_CONFIG);
		return DEFAULT_CONFIG;
	}

	const config = await readJSON<Config>(CONFIG_FILE);

	// Validate config has required fields, otherwise return defaults
	if (!config || !config.defaultMarketplace) {
		await writeJSON(CONFIG_FILE, DEFAULT_CONFIG);
		return DEFAULT_CONFIG;
	}

	return config;
}

/**
 * Sets the default marketplace
 */
export async function setDefaultMarketplace(name: string): Promise<void> {
	const config = await getConfig();
	config.defaultMarketplace = name;
	await writeJSON(CONFIG_FILE, config);
}

/**
 * Sets the registry URL
 */
export async function setRegistryUrl(url: string): Promise<void> {
	const config = await getConfig();
	config.registryUrl = url;
	await writeJSON(CONFIG_FILE, config);
}
