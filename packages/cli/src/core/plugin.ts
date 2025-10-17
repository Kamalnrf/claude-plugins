import { join } from "node:path";
import type { Plugin } from "../types";
import { exists, readJSON } from "../utils/fs";

/**
 * Extracts plugin metadata from a cloned plugin repository
 * Tries multiple locations and formats for metadata
 * @param pluginLocation Absolute path to the plugin directory in marketplace
 * @param pluginName Plugin name for fallback metadata
 * @returns Plugin metadata with local directory source
 */
export async function extractPluginMetadata(
	pluginLocation: string,
	pluginName: string,
): Promise<Plugin> {
	// Use directory source type with absolute path so Claude can discover the plugin
	const source = { source: "directory" as const, path: pluginLocation };

	// Try .claude-plugin/marketplace.json first
	const marketplaceJsonPath = join(
		pluginLocation,
		".claude-plugin",
		"marketplace.json",
	);

	if (await exists(marketplaceJsonPath)) {
		const data = await readJSON<any>(marketplaceJsonPath);

		// If it's a marketplace with plugins array
		if (data?.plugins && Array.isArray(data.plugins)) {
			// Try to find plugin by name, otherwise use first plugin
			const plugin =
				data.plugins.find((p: any) => p.name === pluginName) || data.plugins[0];

			return {
				...plugin,
				source,
			};
		}

		// If it's a single plugin definition
		return {
			name: pluginName,
			...data,
			source,
		};
	}

	// Try .claude-plugin/plugin.json as fallback
	const pluginJsonPath = join(pluginLocation, ".claude-plugin", "plugin.json");
	if (await exists(pluginJsonPath)) {
		const data = await readJSON<any>(pluginJsonPath);
		return {
			name: pluginName,
			...data,
			source,
		};
	}

	// Fallback: minimal metadata with warning
	console.warn(`No metadata found for ${pluginName}, using minimal defaults`);
	return {
		name: pluginName,
		source,
		description: `Plugin: ${pluginName} (no metadata available)`,
		version: "1.0.0",
		author: { name: "Unknown" },
	};
}
