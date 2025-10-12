import { join } from "node:path";
import { exists, readJSON } from "./fs";

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export type RepoType = "marketplace" | "plugin";

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
 * Detects if a cloned repo is a marketplace or a plugin
 * @param repoPath Path to the cloned repository
 * @returns "marketplace" if it contains multiple plugins, "plugin" otherwise
 */
export async function detectRepoType(repoPath: string): Promise<RepoType> {
  const marketplaceJsonPath = join(repoPath, ".claude-plugin", "marketplace.json");

  if (await exists(marketplaceJsonPath)) {
    const data = await readJSON<any>(marketplaceJsonPath);

    // If it has a plugins array, it's a marketplace
    if (data?.plugins && Array.isArray(data.plugins)) {
      return "marketplace";
    }
  }

  // Otherwise it's a single plugin
  return "plugin";
}

/**
 * Validates a plugin identifier format (npm-style only)
 * Accepts:
 * - @namespace/name (scoped)
 * - namespace/name (scoped without @)
 * - name (unscoped)
 *
 * Rejects:
 * - URLs
 * - Invalid characters
 *
 * @param identifier Plugin identifier in npm format
 * @returns true if format is valid
 */
export function isValidPluginIdentifier(identifier: string): boolean {
  if (!identifier || identifier.trim().length === 0) {
    return false;
  }

  // Reject URLs
  if (identifier.startsWith("http://") || identifier.startsWith("https://")) {
    return false;
  }

  // Allow @namespace/name (scoped)
  if (identifier.startsWith("@") && identifier.includes("/")) {
    const parts = identifier.slice(1).split("/");
    return parts.length === 2 && (parts[0]?.length ?? 0) > 0 && (parts[1]?.length ?? 0) > 0;
  }

  // Allow namespace/name (scoped without @)
  if (identifier.includes("/")) {
    const parts = identifier.split("/");
    return parts.length === 2 && (parts[0]?.length ?? 0) > 0 && (parts[1]?.length ?? 0) > 0;
  }

  // Allow unscoped names (no special characters, no slashes)
  return identifier.length > 0 && !identifier.includes("/");
}
