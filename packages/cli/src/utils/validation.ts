import { join } from "node:path";
import { exists } from "./fs";

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validates if a directory contains a valid Claude plugin structure
 * @param repoPath Path to the plugin repository
 * @returns Validation result with reason if invalid
 */
export async function isValidClaudePlugin(repoPath: string): Promise<ValidationResult> {
  // Check if directory exists
  if (!(await exists(repoPath))) {
    return {
      valid: false,
      reason: "Plugin directory does not exist",
    };
  }

  // Check for .claude-plugin directory
  const claudePluginDir = join(repoPath, ".claude-plugin");
  if (!(await exists(claudePluginDir))) {
    return {
      valid: false,
      reason: "Missing .claude-plugin directory",
    };
  }

  // Check for marketplace.json or plugin.json
  const marketplaceJsonPath = join(claudePluginDir, "marketplace.json");
  const pluginJsonPath = join(claudePluginDir, "plugin.json");

  const hasMarketplaceJson = await exists(marketplaceJsonPath);
  const hasPluginJson = await exists(pluginJsonPath);

  if (!hasMarketplaceJson && !hasPluginJson) {
    return {
      valid: false,
      reason: "Missing metadata file (marketplace.json or plugin.json)",
    };
  }

  return {
    valid: true,
  };
}

/**
 * Validates a plugin identifier format
 * @param identifier Plugin identifier (@namespace/name, namespace/name, or URL)
 * @returns true if format is valid
 */
export function isValidPluginIdentifier(identifier: string): boolean {
  if (!identifier || identifier.trim().length === 0) {
    return false;
  }

  // Allow URLs
  if (identifier.startsWith("http://") || identifier.startsWith("https://")) {
    return true;
  }

  // Allow @namespace/name or namespace/name
  if (identifier.includes("/")) {
    const parts = identifier.split("/");
    return parts.length === 2 && (parts[0]?.length ?? 0) > 0 && (parts[1]?.length ?? 0) > 0;
  }

  // Allow simple names
  return identifier.length > 0;
}
