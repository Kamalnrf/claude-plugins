import { intro, outro, spinner, cancel, confirm, isCancel } from "@clack/prompts";
import { readJSON, SETTINGS_FILE } from "../utils/fs";
import { enablePlugin } from "../core/settings";
import type { Settings } from "../types";

/**
 * Enable command - re-enables a disabled plugin
 * @param pluginName Plugin name to enable
 */
export async function enableCommand(pluginName: string): Promise<void> {
  intro("Claude Plugin Manager");

  const s = spinner();

  // Find the plugin in settings (including disabled ones)
  s.start("Finding plugin...");
  const settings = await readJSON<Settings>(SETTINGS_FILE);

  if (!settings || !settings.enabledPlugins) {
    s.stop("No plugins found");
    cancel("No plugins found in settings");
    process.exit(1);
  }

  // Look for the plugin in settings (format: pluginName@marketplaceName)
  const pluginKey = Object.keys(settings.enabledPlugins).find((key) =>
    key.startsWith(`${pluginName}@`)
  );

  if (!pluginKey) {
    s.stop("Plugin not found");
    cancel(`Plugin "${pluginName}" is not installed`);
    process.exit(1);
  }

  const [, marketplaceName] = pluginKey.split("@");
  if (!marketplaceName) {
    s.stop("Invalid marketplace name");
    cancel(`Invalid marketplace name for plugin "${pluginName}"`);
    process.exit(1);
  }

  const isEnabled = settings.enabledPlugins[pluginKey] === true;

  if (isEnabled) {
    s.stop("Plugin already enabled");
    cancel(`Plugin "${pluginName}" is already enabled`);
    process.exit(0);
  }

  s.stop(`Found in marketplace: ${marketplaceName}`);

  const shouldEnable = await confirm({
    message: `Enable "${pluginName}"?`,
    initialValue: true,
  });

  if (!shouldEnable || isCancel(shouldEnable)) {
    cancel("Operation cancelled");
    process.exit(0);
  }

  // Enable the plugin
  s.start("Enabling plugin...");
  await enablePlugin(pluginName, marketplaceName);
  s.stop("Plugin enabled");

  outro(`"${pluginName}" has been enabled ✓`);
}
