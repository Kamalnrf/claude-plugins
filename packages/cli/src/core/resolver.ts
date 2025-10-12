/**
 * Hardcoded plugin registry for MVP
 * Later this will be replaced with API calls
 */
const PLUGIN_REGISTRY: Record<string, string> = {
  "@wshobson/claude-code-essentials": "https://github.com/wshobson/agents.git",
  "@davila7/supabase-toolkit": "https://github.com/davila7/claude-code-templates.git",
  "@every/compounding-engineering": "https://github.com/EveryInc/compounding-engineering-plugin.git",
  // Add more test plugins as needed
};

/**
 * Resolves a plugin identifier to a git URL
 * @param pluginIdentifier Plugin identifier (@namespace/plugin, namespace/plugin, or URL)
 * @returns Git URL if resolved, null if unable to resolve
 */
export function resolvePluginUrl(pluginIdentifier: string): string | null {
  // Handle @namespace/plugin format - look up in registry
  if (pluginIdentifier.startsWith("@")) {
    return PLUGIN_REGISTRY[pluginIdentifier] || null;
  }

  // Handle direct URLs
  if (pluginIdentifier.startsWith("http://") || pluginIdentifier.startsWith("https://")) {
    return pluginIdentifier;
  }

  // Handle namespace/repo format - assume GitHub
  if (pluginIdentifier.includes("/")) {
    return `https://github.com/${pluginIdentifier}.git`;
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
