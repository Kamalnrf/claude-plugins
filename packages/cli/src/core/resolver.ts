/**
 * Claude Plugins Registry API
 * Production API deployed on Val Town
 */
const REGISTRY_API_URL = "https://kamalnrf--44867e10a75311f08f880224a6c84d84.web.val.run";

/**
 * Resolves a plugin identifier to a git URL
 * @param pluginIdentifier Plugin identifier (@namespace/plugin, namespace/plugin, or URL)
 * @returns Git URL if resolved, null if unable to resolve
 */
export async function resolvePluginUrl(pluginIdentifier: string): Promise<string | null> {
  // Handle direct URLs - no API lookup needed
  if (pluginIdentifier.startsWith("http://") || pluginIdentifier.startsWith("https://")) {
    return pluginIdentifier;
  }

  // Handle @namespace/plugin or namespace/plugin format - query API
  if (pluginIdentifier.startsWith("@") || pluginIdentifier.includes("/")) {
    try {
      // Remove @ prefix if present for API call
      const identifier = pluginIdentifier.startsWith("@")
        ? pluginIdentifier.slice(1)
        : pluginIdentifier;

      const response = await fetch(`${REGISTRY_API_URL}/api/resolve/${identifier}`);

      if (!response.ok) {
        // Plugin not found in registry, fall back to GitHub assumption
        if (response.status === 404 && pluginIdentifier.includes("/")) {
          return `https://github.com/${identifier}.git`;
        }
        return null;
      }

      const data = await response.json();
      return data.gitUrl;
    } catch (error) {
      console.error(`Failed to resolve plugin ${pluginIdentifier}:`, error);

      // Fallback to GitHub assumption for namespace/plugin format
      if (pluginIdentifier.includes("/")) {
        const identifier = pluginIdentifier.startsWith("@")
          ? pluginIdentifier.slice(1)
          : pluginIdentifier;
        return `https://github.com/${identifier}.git`;
      }

      return null;
    }
  }

  // Unable to resolve
  return null;
}

/**
 * Extracts the plugin name from a plugin identifier
 * @param pluginIdentifier Plugin identifier
 * @returns Plugin name (last part after /)
 */
export function extractPluginName(pluginIdentifier: string): string {
  // @namespace/plugin-name -> plugin-name
  if (pluginIdentifier.startsWith("@")) {
    return pluginIdentifier.split("/").pop()!.replace(/\.git$/, "");
  }

  // Direct URL or namespace/plugin-name -> extract last part
  if (pluginIdentifier.includes("/")) {
    const name = pluginIdentifier.split("/").pop()!;
    // Remove .git suffix if present
    return name.replace(/\.git$/, "");
  }

  // Plain name
  return pluginIdentifier.replace(/\.git$/, "");
}
