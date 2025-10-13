import { intro, outro, note } from "@clack/prompts";
import { listEnabledPlugins } from "../core/settings";
import pc from "picocolors";

/**
 * List command - lists all installed plugins
 */
export async function listCommand(): Promise<void> {
  intro(pc.cyan("Claude Plugins"));

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
      output += `\n${pc.dim(marketplace)}:\n`;
      for (const plugin of marketplacePlugins) {
        const status = plugin.enabled ? pc.green("✓") : pc.dim("✗");
        const pluginDisplay = plugin.enabled ? plugin.name : pc.dim(plugin.name);
        output += `  ${status} ${pluginDisplay}\n`;
      }
    }

    note(output.trim(), "Plugins");
  }

  outro("Done");
}
