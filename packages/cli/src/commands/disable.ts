import { intro, outro, spinner, cancel, confirm, isCancel } from "@clack/prompts";
import pc from "picocolors";
import { disablePlugin, listEnabledPlugins } from "../core/settings";

/**
 * Disable command - disables a plugin without removing files
 * @param pluginName Plugin name to disable
 */
export async function disableCommand(pluginName: string): Promise<void> {
  intro(pc.cyan("Claude Plugins"));

  const shouldDisable = await confirm({
    message: `Disable "${pluginName}"?`,
    initialValue: false,
  });

  if (!shouldDisable || isCancel(shouldDisable)) {
    cancel("Operation cancelled");
    process.exit(0);
  }

  const s = spinner();

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
  s.stop(`Found in marketplace: ${pc.dim(marketplaceName)}`);

  // Disable the plugin
  s.start("Disabling plugin...");
  await disablePlugin(pluginName, marketplaceName);
  s.stop("Plugin disabled");

  outro(pc.green(`"${pluginName}" has been disabled ✓`));
}
