import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { getConfig } from "../config";
import type { KnownMarketplace, Marketplace, Plugin } from "../types";
import {
	KNOWN_MARKETPLACES_FILE,
	MARKETPLACES_DIR,
	readJSON,
	writeJSON,
} from "../utils/fs";

/**
 * Creates a default marketplace template
 */
async function createMarketplaceTemplate(
	installLocation: string,
	name: string,
): Promise<void> {
	await mkdir(installLocation, { recursive: true });
	await mkdir(join(installLocation, ".claude-plugin"), { recursive: true });

	const template: Marketplace = {
		name,
		owner: { name: "Local", url: "" },
		metadata: { description: "Local marketplace", version: "1.0.0" },
		plugins: [],
	};

	await writeJSON(
		join(installLocation, ".claude-plugin", "marketplace.json"),
		template,
	);
}

/**
 * Ensures the default marketplace exists, bootstrapping if necessary
 * @param marketplaceName Optional marketplace name (uses config default if not provided)
 * @returns Path to marketplace installation location
 */
export async function ensureDefaultMarketplace(
	marketplaceName?: string,
): Promise<string> {
	const config = await getConfig();
	const name = marketplaceName || config.defaultMarketplace;

	const knownMarketplaces =
		(await readJSON<Record<string, KnownMarketplace>>(
			KNOWN_MARKETPLACES_FILE,
		)) || {};

	// Return if already registered
	if (knownMarketplaces?.[name]) {
		return knownMarketplaces[name].installLocation;
	}

	// Bootstrap a local marketplace clone or create template
	// In the future, this would try to clone from a registry URL first
	const installLocation = join(MARKETPLACES_DIR, name);
	await createMarketplaceTemplate(installLocation, name);

	// Register
	knownMarketplaces[name] = {
		source: { source: "directory", path: installLocation },
		installLocation,
		lastUpdated: new Date().toISOString(),
	};

	await writeJSON(KNOWN_MARKETPLACES_FILE, knownMarketplaces);
	return installLocation;
}

/**
 * Registers a new marketplace from a cloned repository
 * @param marketplaceName Name to register the marketplace as
 * @param installLocation Absolute path where the marketplace is cloned
 * @returns true if successful
 */
export async function registerMarketplace({
	marketplaceName,
	installLocation,
	gitPath,
}: {
	marketplaceName: string;
	installLocation: string;
	gitPath: `${string}.git`;
}): Promise<boolean> {
	const knownMarketplaces =
		(await readJSON<Record<string, KnownMarketplace>>(
			KNOWN_MARKETPLACES_FILE,
		)) || {};

	// Register the marketplace
	knownMarketplaces[marketplaceName] = {
		source: { source: "git", url: gitPath },
		installLocation,
		lastUpdated: new Date().toISOString(),
	};

	await writeJSON(KNOWN_MARKETPLACES_FILE, knownMarketplaces);
	return true;
}

/**
 * Gets a marketplace's manifest
 * @param marketplaceName Marketplace name
 * @returns Marketplace manifest or null if not found
 */
export async function getMarketplaceManifest(
	marketplaceName: string,
): Promise<Marketplace | null> {
	const knownMarketplaces =
		(await readJSON<Record<string, KnownMarketplace>>(
			KNOWN_MARKETPLACES_FILE,
		)) || {};

	if (!knownMarketplaces || !knownMarketplaces[marketplaceName]) {
		return null;
	}

	const { installLocation } = knownMarketplaces[marketplaceName];
	const manifestPath = join(
		installLocation,
		".claude-plugin",
		"marketplace.json",
	);

	return await readJSON<Marketplace>(manifestPath);
}

/**
 * Adds a plugin to a marketplace's registry
 * @param marketplaceName Marketplace name
 * @param plugin Plugin to add
 * @returns true if successful
 */
export async function addPluginToMarketplace(
	marketplaceName: string,
	plugin: Plugin,
): Promise<boolean> {
	const manifest = await getMarketplaceManifest(marketplaceName);
	if (!manifest) {
		return false;
	}

	// Add new plugin and remove existing plugin with same name if present
	manifest.plugins = manifest.plugins.filter((p) => p.name !== plugin.name);
	manifest.plugins.push(plugin);

	// Write back
	const knownMarketplaces =
		(await readJSON<Record<string, KnownMarketplace>>(
			KNOWN_MARKETPLACES_FILE,
		)) || {};

	if (!knownMarketplaces[marketplaceName]) {
		return false;
	}

	const { installLocation } = knownMarketplaces[marketplaceName];
	const manifestPath = join(
		installLocation,
		".claude-plugin",
		"marketplace.json",
	);

	await writeJSON(manifestPath, manifest);
	return true;
}

/**
 * Removes a plugin from a marketplace's registry
 * @param marketplaceName Marketplace name
 * @param pluginName Plugin name to remove
 * @returns true if successful
 */
export async function removePluginFromMarketplace(
	marketplaceName: string,
	pluginName: string,
): Promise<boolean> {
	const manifest = await getMarketplaceManifest(marketplaceName);
	if (!manifest) {
		return false;
	}

	// Filter out the plugin
	manifest.plugins = manifest.plugins.filter((p) => p.name !== pluginName);

	// Write back
	const knownMarketplaces =
		(await readJSON<Record<string, KnownMarketplace>>(
			KNOWN_MARKETPLACES_FILE,
		)) || {};

	if (!knownMarketplaces[marketplaceName]) {
		return false;
	}

	const { installLocation } = knownMarketplaces[marketplaceName];
	const manifestPath = join(
		installLocation,
		".claude-plugin",
		"marketplace.json",
	);

	await writeJSON(manifestPath, manifest);
	return true;
}

/**
 * Unregisters a marketplace from known_marketplaces.json
 * @param marketplaceName Marketplace name to unregister
 * @returns true if successful
 */
export async function unregisterMarketplace(
	marketplaceName: string,
): Promise<boolean> {
	const knownMarketplaces =
		(await readJSON<Record<string, KnownMarketplace>>(
			KNOWN_MARKETPLACES_FILE,
		)) || {};

	if (!knownMarketplaces[marketplaceName]) {
		return false;
	}

	delete knownMarketplaces[marketplaceName];
	await writeJSON(KNOWN_MARKETPLACES_FILE, knownMarketplaces);
	return true;
}
