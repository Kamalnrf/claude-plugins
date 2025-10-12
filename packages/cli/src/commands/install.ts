import { intro, outro, spinner, cancel, note } from "@clack/prompts";
import { join } from "node:path";
import { rm } from "node:fs/promises";
import { ensureDirectories, CACHE_DIR } from "../utils/fs";
import { cloneRepo } from "../utils/git";
import { isValidClaudePlugin } from "../utils/validation";
import { getConfig } from "../config";
import { resolvePluginUrl, extractPluginName } from "../core/resolver";
import { extractPluginMetadata } from "../core/plugin";
import { ensureDefaultMarketplace, addPluginToMarketplace, removePluginFromMarketplace } from "../core/marketplace";
import { enablePlugin } from "../core/settings";

/**
 * Install command - installs a plugin from a URL or identifier
 * @param pluginIdentifier Plugin identifier (@namespace/name, namespace/name, or URL)
 */
export async function installCommand(pluginIdentifier: string): Promise<void> {
  intro("Claude Plugin Installer");

  await ensureDirectories();
  const config = await getConfig();

  // Step 1: Resolve plugin URL
  const s = spinner();
  s.start("Resolving plugin URL...");

  const pluginUrl = resolvePluginUrl(pluginIdentifier);
  if (!pluginUrl) {
    s.stop("Failed to resolve");
    cancel(`Unable to resolve "${pluginIdentifier}"`);
    process.exit(1);
  }

  const pluginName = extractPluginName(pluginIdentifier);
  s.stop(`Resolved: ${pluginName} → ${pluginUrl}`);

  // Step 2: Ensure marketplace exists
  s.start("Checking marketplace...");
  await ensureDefaultMarketplace(config.defaultMarketplace);
  s.stop(`Using marketplace: ${config.defaultMarketplace}`);

  const cacheLocation = join(CACHE_DIR, pluginName);
  let cloned = false;
  let registered = false;

  try {
    // Step 3: Clone plugin
    s.start(`Cloning plugin: ${pluginName}...`);
    await rm(cacheLocation, { recursive: true, force: true });

    cloned = await cloneRepo(pluginUrl, cacheLocation);
    if (!cloned) {
      throw new Error("Clone failed");
    }
    s.stop("Plugin cloned");

    // Step 4: Validate plugin structure
    s.start("Validating plugin structure...");
    const validation = await isValidClaudePlugin(cacheLocation);
    if (!validation.valid) {
      throw new Error(`Invalid plugin: ${validation.reason}`);
    }
    s.stop("Plugin validated");

    // Step 5: Extract metadata
    s.start("Reading plugin metadata...");
    const plugin = await extractPluginMetadata(cacheLocation, pluginName, pluginUrl);
    s.stop("Metadata extracted");

    // Step 6: Register in marketplace
    s.start("Registering plugin...");
    registered = await addPluginToMarketplace(config.defaultMarketplace, plugin);
    if (!registered) {
      throw new Error("Registration failed");
    }
    s.stop("Plugin registered");

    // Step 7: Enable plugin
    s.start("Enabling plugin...");
    await enablePlugin(pluginName, config.defaultMarketplace);
    s.stop("Plugin enabled");

    note(`${pluginName} installed and enabled!`, "Success");
    outro("Installation complete ✓");
  } catch (error: any) {
    // Rollback on failure
    cancel(`Installation failed: ${error.message}`);

    if (registered) {
      await removePluginFromMarketplace(config.defaultMarketplace, pluginName);
    }

    if (cloned) {
      await rm(cacheLocation, { recursive: true, force: true });
    }

    process.exit(1);
  }
}
