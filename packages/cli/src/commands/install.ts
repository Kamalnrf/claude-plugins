import { intro, outro, spinner, cancel, note } from "@clack/prompts";
import { join } from "node:path";
import { rm, rename } from "node:fs/promises";
import pc from "picocolors";
import { ensureDirectories, MARKETPLACES_DIR, readJSON } from "../utils/fs";
import { cloneRepo } from "../utils/git";
import { isValidClaudePlugin, detectRepoType } from "../utils/validation";
import { getConfig } from "../config";
import { resolvePluginUrl, extractPluginName } from "../core/resolver";
import { extractPluginMetadata } from "../core/plugin";
import { ensureDefaultMarketplace, addPluginToMarketplace, removePluginFromMarketplace, registerMarketplace } from "../core/marketplace";
import { enablePlugin } from "../core/settings";

/**
 * Install command - installs a plugin or marketplace from a URL or identifier
 * @param pluginIdentifier Plugin/Marketplace identifier (@namespace/name, namespace/name, or URL)
 */
export async function installCommand(pluginIdentifier: string): Promise<void> {
  intro(pc.cyan("Claude Plugins"));

  await ensureDirectories();
  const config = await getConfig();

  // Step 1: Resolve URL
  const s = spinner();
  s.start("Resolving URL...");

  const url = await resolvePluginUrl(pluginIdentifier);
  if (!url) {
    s.stop("Failed to resolve");
    note(
      `Plugin ${pc.cyan(pluginIdentifier)} not found in the registry.\n\nVisit ${pc.blue(pc.underline("https://claude-plugins.dev"))} to discover available plugins.`,
      "Not Found"
    );
    cancel(`Unable to resolve "${pluginIdentifier}"`);
    process.exit(1);
  }

  const name = extractPluginName(pluginIdentifier);
  s.stop(`Resolved: ${name} → ${url}`);

  // Step 2: Clone to temporary location first
  const tempLocation = join(MARKETPLACES_DIR, `.temp-${name}`);

  try {
    s.start(`Installing ${name}...`);
    await rm(tempLocation, { recursive: true, force: true });

    const cloned = await cloneRepo(url, tempLocation);
    if (!cloned) {
      s.stop("Failed to install");
      note(
        `Plugin ${pc.cyan(pluginIdentifier)} ${pc.red("failed to be cloned")}. Please check if this repo ${pc.blue(pc.underline(url))} exists.
        You can also raise an issue at ${pc.blue(pc.underline("https://github.com/Kamalnrf/claude-plugins/issues"))} to get help.`,
        "Clone Step Failed"
      )
      throw new Error("Clone failed");
    }
    s.stop(`Cloned Repo`)

    // Step 3: Validate structure
    const validation = await isValidClaudePlugin(tempLocation);
    if (!validation.valid) {
      s.stop("Plugin appears to be invalid");
      note(`Reason: ${validation.reason}`, "Validation Step Failed");
      throw new Error(`Invalid: ${validation.reason}`);
    }

    // Step 4: Detect if marketplace or plugin
    const repoType = await detectRepoType(tempLocation);

    if (repoType === "marketplace") {
      await installMarketplace(name, tempLocation, s);
    } else {
      await installPlugin(name, tempLocation, config.defaultMarketplace, s);
    }

    note(`Start a new Claude Code session to use the new plugin "${name}".`, "Installed successfully");
    outro(pc.green("Installation complete ✓"));
  } catch (error: any) {
    cancel(`Installation failed: ${error.message}`);
    await rm(tempLocation, { recursive: true, force: true });
    process.exit(1);
  }
}

/**
 * Installs a marketplace by moving it to marketplaces directory and registering it
 */
async function installMarketplace(
  identifierName: string,
  tempLocation: string,
  s: any
): Promise<void> {
  s.start("Enabling plugin...");
  // Read marketplace.json from temp location to get the actual marketplace name
  // s.start("Reading marketplace metadata...");
  const marketplaceJsonPath = join(tempLocation, ".claude-plugin", "marketplace.json");
  const marketplaceData = await readJSON<any>(marketplaceJsonPath);
  const marketplaceName = marketplaceData?.name || identifierName;
  // s.stop(`Marketplace name: ${marketplaceName}`);

  // Use marketplace name for directory
  const finalLocation = join(MARKETPLACES_DIR, marketplaceName);

  // Move from temp to final location
  // s.start("Installing marketplace...");
  await rm(finalLocation, { recursive: true, force: true });
  await rename(tempLocation, finalLocation);
  // s.stop("Marketplace installed");

  // Register marketplace using marketplace name
  // s.start("Registering marketplace...");
  await registerMarketplace(marketplaceName, finalLocation);
  // s.stop(`Marketplace "${marketplaceName}" registered`);

  // Enable the plugin using the identifier name (directory name from identifier)
  // For @every/compounding-engineering: pluginName = "compounding-engineering", marketplaceName = "every-marketplace"
  await enablePlugin(identifierName, marketplaceName);
  s.stop(`Plugin "${identifierName}" enabled from marketplace ${pc.dim(marketplaceName)}`);
}

/**
 * Installs a plugin by moving it to local marketplace directory and registering it
 */
async function installPlugin(
  pluginName: string,
  tempLocation: string,
  marketplaceName: string,
  s: any
): Promise<void> {
  // Ensure local marketplace exists
  s.start("Checking local marketplace...");
  const marketplaceLocation = await ensureDefaultMarketplace(marketplaceName);
  s.stop(`Using marketplace: ${marketplaceName}`);

  const finalLocation = join(marketplaceLocation, pluginName);

  // Move from temp to final location
  s.start("Installing plugin...");
  await rm(finalLocation, { recursive: true, force: true });
  await rename(tempLocation, finalLocation);
  s.stop("Plugin installed");

  // Extract metadata with local directory path
  s.start("Reading metadata...");
  const plugin = await extractPluginMetadata(finalLocation, pluginName);
  s.stop("Metadata extracted");

  // Register in marketplace
  s.start("Registering plugin...");
  const registered = await addPluginToMarketplace(marketplaceName, plugin);
  if (!registered) {
    throw new Error("Registration failed");
  }
  s.stop("Plugin registered");

  // Enable plugin
  s.start("Enabling plugin...");
  await enablePlugin(pluginName, marketplaceName);
  s.stop("Plugin enabled");
}
