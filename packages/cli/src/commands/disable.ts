import { intro, outro, spinner, cancel, confirm, isCancel } from "@clack/prompts";
import { join } from "node:path";
import { rm } from "node:fs/promises";
import { KNOWN_MARKETPLACES_FILE, readJSON } from "../utils/fs";
import { getConfig } from "../config";
import { unregisterMarketplace } from "../core/marketplace";
import { disablePlugin, listEnabledPlugins } from "../core/settings";
import type { KnownMarketplace } from "../types";

/**
 * Disable command - disables a plugin
 * For local marketplace plugins: removes files if it's the last plugin
 * For external marketplace plugins: just disables them
 * @param pluginName Plugin name to disable
 */
export async function disableCommand(pluginName: string): Promise<void> {
  intro("Claude Plugin Manager");

  const shouldDisable = await confirm({
    message: `Disable "${pluginName}"?`,
    initialValue: false,
  });

  if (!shouldDisable || isCancel(shouldDisable)) {
    cancel("Operation cancelled");
    process.exit(0);
  }

  const s = spinner();
  const config = await getConfig();

  // Find which marketplace the plugin belongs to
  s.start("Finding plugin...");
  const enabledPlugins = await listEnabledPlugins();
  const pluginEntry = enabledPlugins.find((p) => p.name === pluginName);

  if (!pluginEntry) {
    s.stop("Plugin not found");
    cancel(`Plugin "${pluginName}" is not installed`);
    process.exit(1);
  }

  const marketplaceName = pluginEntry.marketplace;
  const isLocalMarketplace = marketplaceName === config.defaultMarketplace;
  s.stop(`Found in marketplace: ${marketplaceName} ${isLocalMarketplace ? "(local)" : "(external)"}`);

  // Disable the plugin
  s.start("Disabling plugin...");
  await disablePlugin(pluginName, marketplaceName);
  s.stop("Plugin disabled");

  // Only remove files if it's from the local marketplace
  if (isLocalMarketplace) {
    // Check if there are any other enabled plugins from the local marketplace
    s.start("Checking for other plugins in local marketplace...");
    const allEnabledPlugins = await listEnabledPlugins();
    const otherPluginsInMarketplace = allEnabledPlugins.filter(
      (p) => p.marketplace === marketplaceName && p.name !== pluginName && p.enabled
    );

    if (otherPluginsInMarketplace.length === 0) {
      s.stop("No other enabled plugins in local marketplace");

      // Delete the entire local marketplace
      s.start("Removing local marketplace...");
      const knownMarketplaces =
        (await readJSON<Record<string, KnownMarketplace>>(KNOWN_MARKETPLACES_FILE)) || {};

      if (knownMarketplaces[marketplaceName]) {
        const { installLocation } = knownMarketplaces[marketplaceName];
        await rm(installLocation, { recursive: true, force: true });
        await unregisterMarketplace(marketplaceName);
        s.stop(`Local marketplace "${marketplaceName}" removed`);
        outro(`"${pluginName}" disabled and local marketplace removed ✓`);
      } else {
        s.stop("Marketplace not found");
        outro(`"${pluginName}" has been disabled ✓`);
      }
    } else {
      s.stop(`${otherPluginsInMarketplace.length} other plugin(s) in local marketplace`);

      // Remove just this plugin's files from local marketplace
      s.start("Removing plugin files...");
      const knownMarketplaces =
        (await readJSON<Record<string, KnownMarketplace>>(KNOWN_MARKETPLACES_FILE)) || {};

      if (knownMarketplaces[marketplaceName]) {
        const { installLocation } = knownMarketplaces[marketplaceName];
        const pluginLocation = join(installLocation, pluginName);
        await rm(pluginLocation, { recursive: true, force: true });
        s.stop("Plugin files removed");
      }

      outro(`"${pluginName}" has been disabled and removed from local marketplace ✓`);
    }
  } else {
    // External marketplace - just disable, don't remove files
    outro(`"${pluginName}" has been disabled ✓`);
  }
}
