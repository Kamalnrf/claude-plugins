import { intro, outro, note } from "@clack/prompts";
import { listEnabledPlugins } from "../core/settings";

/**
 * List command - lists all installed plugins
 */
export async function listCommand(): Promise<void> {
  intro("Installed Plugins");

  const plugins = await listEnabledPlugins();

  if (plugins.length === 0) {
    note("No plugins installed", "Empty");
  } else {
    // Group plugins by marketplace
    const grouped = plugins.reduce(
      (acc, plugin) => {
        if (!acc[plugin.marketplace]) {
          acc[plugin.marketplace] = [];
        }
        acc[plugin.marketplace]?.push(plugin);

        return acc;
      },
      {} as Record<string, typeof plugins>
    );

    let output = "";
    for (const [marketplace, marketplacePlugins] of Object.entries(grouped)) {
      output += `\n${marketplace}:\n`;
      for (const plugin of marketplacePlugins) {
        const status = plugin.enabled ? "✓" : "✗";
        output += `  ${status} ${plugin.name}\n`;
      }
    }

    note(output.trim(), "Plugins");
  }

  outro("Done");
}
