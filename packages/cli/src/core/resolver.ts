/**
 * Claude Plugins Registry API
 * Production API deployed on Val Town
 */
const REGISTRY_API_URL = "https://kamalnrf--44867e10a75311f08f880224a6c84d84.web.val.run";

/**
 * Resolves a plugin identifier to a git URL by querying the registry API
 * Supports npm-style package names:
 * - @namespace/plugin (scoped)
 * - namespace/plugin (scoped without @)
 * - plugin (unscoped)
 *
 * @param pluginIdentifier Plugin identifier in npm format
 * @returns Git URL if resolved, null if unable to resolve
 */
export async function resolvePluginUrl(pluginIdentifier: string): Promise<string | null> {
  try {
    let apiPath: string;

    // Handle @namespace/plugin format (scoped)
    if (pluginIdentifier.startsWith("@") && pluginIdentifier.includes("/")) {
      // Remove @ prefix for API call: @namespace/plugin -> namespace/plugin
      apiPath = pluginIdentifier.slice(1);
    }
    // Handle namespace/plugin format (scoped without @)
    else if (pluginIdentifier.includes("/")) {
      apiPath = pluginIdentifier;
    }
    // Handle unscoped plugin format
    else {
      apiPath = pluginIdentifier;
    }

    const response = await fetch(`${REGISTRY_API_URL}/api/resolve/${apiPath}`);

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      gitUrl: string;
    };
    if (!data.gitUrl) {
      throw new Error(`Invalid response from registry API: ${data}`);
    }

    return data.gitUrl;
  } catch (error) {
    return null;
  }
}

/**
 * Extracts the plugin name from a plugin identifier
 * Supports npm-style package names:
 * - @namespace/plugin -> plugin
 * - namespace/plugin -> plugin
 * - plugin -> plugin
 *
 * @param pluginIdentifier Plugin identifier in npm format
 * @returns Plugin name (last part after / or the entire identifier if no /)
 */
export function extractPluginName(pluginIdentifier: string): string {
  // Handle @namespace/plugin or namespace/plugin -> extract plugin name
  if (pluginIdentifier.includes("/")) {
    return pluginIdentifier.split("/").pop()!;
  }

  // Unscoped plugin name
  return pluginIdentifier;
}
