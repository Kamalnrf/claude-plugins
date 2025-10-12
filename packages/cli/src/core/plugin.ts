import { join } from "node:path";
import { readJSON, exists } from "../utils/fs";
import type { Plugin } from "../types";

/**
 * Extracts plugin metadata from a cloned plugin repository
 * Tries multiple locations and formats for metadata
 * @param cacheLocation Path to the cloned plugin repository
 * @param pluginName Plugin name for fallback metadata
 * @param pluginUrl Plugin URL for source metadata
 * @returns Plugin metadata
 */
export async function extractPluginMetadata(
  cacheLocation: string,
  pluginName: string,
  pluginUrl: string
): Promise<Plugin> {
  // Try .claude-plugin/marketplace.json first
  const marketplaceJsonPath = join(cacheLocation, ".claude-plugin", "marketplace.json");

  if (await exists(marketplaceJsonPath)) {
    const data = await readJSON<any>(marketplaceJsonPath);

    // If it's a marketplace with plugins array
    if (data?.plugins && Array.isArray(data.plugins)) {
      // Try to find plugin by name, otherwise use first plugin
      const plugin = data.plugins.find((p: any) => p.name === pluginName) || data.plugins[0];

      return {
        ...plugin,
        source: { source: "url", url: pluginUrl },
      };
    }

    // If it's a single plugin definition
    return {
      name: pluginName,
      ...data,
      source: { source: "url", url: pluginUrl },
    };
  }

  // Try .claude-plugin/plugin.json as fallback
  const pluginJsonPath = join(cacheLocation, ".claude-plugin", "plugin.json");
  if (await exists(pluginJsonPath)) {
    const data = await readJSON<any>(pluginJsonPath);
    return {
      name: pluginName,
      ...data,
      source: { source: "url", url: pluginUrl },
    };
  }

  // Fallback: minimal metadata with warning
  console.warn(`No metadata found for ${pluginName}, using minimal defaults`);
  return {
    name: pluginName,
    source: { source: "url", url: pluginUrl },
    description: `Plugin: ${pluginName} (no metadata available)`,
    version: "1.0.0",
    author: { name: "Unknown" },
  };
}
