import { readJSON, writeJSON, SETTINGS_FILE, exists } from "../utils/fs";
import type { Settings } from "../types";

const DEFAULT_SETTINGS: Settings = {
  enabledPlugins: {},
};

/**
 * Gets Claude Code settings
 */
export async function getSettings(): Promise<Settings> {
  if (!(await exists(SETTINGS_FILE))) {
    await writeJSON(SETTINGS_FILE, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }

  const settings = await readJSON<Settings>(SETTINGS_FILE);
  return settings || DEFAULT_SETTINGS;
}

/**
 * Enables a plugin in settings
 * @param pluginName Plugin name
 * @param marketplaceName Marketplace name
 */
export async function enablePlugin(pluginName: string, marketplaceName: string): Promise<void> {
  const settings = await getSettings();
  const key = `${pluginName}@${marketplaceName}`;
  settings.enabledPlugins[key] = true;
  await writeJSON(SETTINGS_FILE, settings);
}

/**
 * Disables a plugin in settings
 * @param pluginName Plugin name
 * @param marketplaceName Marketplace name
 */
export async function disablePlugin(pluginName: string, marketplaceName: string): Promise<void> {
  const settings = await getSettings();
  const key = `${pluginName}@${marketplaceName}`;
  settings.enabledPlugins[key] = false;
  await writeJSON(SETTINGS_FILE, settings);
}

/**
 * Removes a plugin from settings entirely
 * @param pluginName Plugin name
 * @param marketplaceName Marketplace name
 */
export async function removePluginFromSettings(
  pluginName: string,
  marketplaceName: string
): Promise<void> {
  const settings = await getSettings();
  const key = `${pluginName}@${marketplaceName}`;
  delete settings.enabledPlugins[key];
  await writeJSON(SETTINGS_FILE, settings);
}

/**
 * Checks if a plugin is enabled
 * @param pluginName Plugin name
 * @param marketplaceName Marketplace name
 * @returns true if enabled, false otherwise
 */
export async function isPluginEnabled(
  pluginName: string,
  marketplaceName: string
): Promise<boolean> {
  const settings = await getSettings();
  const key = `${pluginName}@${marketplaceName}`;
  return settings.enabledPlugins[key] === true;
}

/**
 * Lists all plugins from settings
 * @returns Array of plugin info with name, marketplace, and enabled status
 */
export async function listEnabledPlugins(): Promise<
  Array<{ name: string; marketplace: string; enabled: boolean }>
> {
  const settings = await getSettings();
  const plugins: Array<{ name: string; marketplace: string; enabled: boolean }> = [];

  for (const [key, enabled] of Object.entries(settings.enabledPlugins)) {
    const [name, marketplace] = key.split("@");
    if (!name || !marketplace) continue;

    plugins.push({
      name,
      marketplace,
      enabled,
    });
  }

  return plugins;
}
