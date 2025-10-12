import { intro, outro, spinner, cancel, confirm, isCancel } from "@clack/prompts";
import { join } from "node:path";
import { rm } from "node:fs/promises";
import { CACHE_DIR } from "../utils/fs";
import { getConfig } from "../config";
import { removePluginFromMarketplace } from "../core/marketplace";
import { removePluginFromSettings } from "../core/settings";

/**
 * Remove command - removes a plugin
 * @param pluginName Plugin name to remove
 */
export async function removeCommand(pluginName: string): Promise<void> {
  intro("Claude Plugin Remover");

  const config = await getConfig();

  const shouldRemove = await confirm({
    message: `Remove "${pluginName}"?`,
    initialValue: false,
  });

  if (!shouldRemove || isCancel(shouldRemove)) {
    cancel("Operation cancelled");
    process.exit(0);
  }

  const s = spinner();

  s.start("Disabling plugin...");
  await removePluginFromSettings(pluginName, config.defaultMarketplace);
  s.stop("Plugin disabled");

  s.start("Removing from marketplace...");
  await removePluginFromMarketplace(config.defaultMarketplace, pluginName);
  s.stop("Removed from marketplace");

  s.start("Cleaning up cache...");
  const cacheLocation = join(CACHE_DIR, pluginName);
  await rm(cacheLocation, { recursive: true, force: true });
  s.stop("Cache cleaned");

  outro(`"${pluginName}" has been removed ✓`);
}
