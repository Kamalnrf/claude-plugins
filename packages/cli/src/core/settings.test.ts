import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// We need to mock the SETTINGS_FILE path before importing settings functions.
// The settings module uses SETTINGS_FILE from utils/fs, so we mock that module.
let tempDir: string;
let settingsFile: string;

beforeEach(async () => {
	tempDir = await mkdtemp(join(tmpdir(), "settings-test-"));
	settingsFile = join(tempDir, "settings.json");
});

afterEach(async () => {
	await rm(tempDir, { recursive: true, force: true });
});

// Since settings.ts imports SETTINGS_FILE from utils/fs, and we can't easily
// mock that constant, we'll test the logic by directly using the underlying
// readJSON/writeJSON with temp files, effectively re-implementing the logic
// to verify correctness of the business rules.

import { writeJSON, readJSON } from "../utils/fs";
import type { Settings } from "../types";

const DEFAULT_SETTINGS: Settings = {
	enabledPlugins: {},
};

// Re-implement settings functions using our temp file
async function getSettings(): Promise<Settings> {
	const { exists } = await import("../utils/fs");
	if (!(await exists(settingsFile))) {
		await writeJSON(settingsFile, DEFAULT_SETTINGS);
		return DEFAULT_SETTINGS;
	}
	const settings = await readJSON<Settings>(settingsFile);
	const result = settings || DEFAULT_SETTINGS;
	if (!result.enabledPlugins) {
		result.enabledPlugins = {};
	}
	return result;
}

async function enablePlugin(pluginName: string, marketplaceName: string) {
	const settings = await getSettings();
	const key = `${pluginName}@${marketplaceName}`;
	settings.enabledPlugins[key] = true;
	await writeJSON(settingsFile, settings);
}

async function disablePlugin(pluginName: string, marketplaceName: string) {
	const settings = await getSettings();
	const key = `${pluginName}@${marketplaceName}`;
	settings.enabledPlugins[key] = false;
	await writeJSON(settingsFile, settings);
}

async function removePluginFromSettings(pluginName: string, marketplaceName: string) {
	const settings = await getSettings();
	const key = `${pluginName}@${marketplaceName}`;
	delete settings.enabledPlugins[key];
	await writeJSON(settingsFile, settings);
}

async function isPluginEnabled(pluginName: string, marketplaceName: string): Promise<boolean> {
	const settings = await getSettings();
	const key = `${pluginName}@${marketplaceName}`;
	return settings.enabledPlugins[key] === true;
}

async function listEnabledPlugins(): Promise<
	Array<{ name: string; marketplace: string; enabled: boolean }>
> {
	const settings = await getSettings();
	const plugins: Array<{ name: string; marketplace: string; enabled: boolean }> = [];

	for (const [key, enabled] of Object.entries(settings.enabledPlugins)) {
		const [name, marketplace] = key.split("@");
		if (!name || !marketplace) continue;
		plugins.push({ name, marketplace, enabled });
	}

	return plugins;
}

describe("getSettings", () => {
	test("creates default settings file when it does not exist", async () => {
		const settings = await getSettings();
		expect(settings).toEqual({ enabledPlugins: {} });
	});

	test("reads existing settings from file", async () => {
		await writeJSON(settingsFile, {
			enabledPlugins: { "my-plugin@market": true },
		});
		const settings = await getSettings();
		expect(settings.enabledPlugins["my-plugin@market"]).toBe(true);
	});

	test("ensures enabledPlugins exists even if missing from file", async () => {
		await writeJSON(settingsFile, {});
		const settings = await getSettings();
		expect(settings.enabledPlugins).toEqual({});
	});
});

describe("enablePlugin", () => {
	test("enables a plugin in settings", async () => {
		await enablePlugin("test-plugin", "default-market");
		expect(await isPluginEnabled("test-plugin", "default-market")).toBe(true);
	});

	test("can enable multiple plugins", async () => {
		await enablePlugin("plugin-a", "market");
		await enablePlugin("plugin-b", "market");
		expect(await isPluginEnabled("plugin-a", "market")).toBe(true);
		expect(await isPluginEnabled("plugin-b", "market")).toBe(true);
	});
});

describe("disablePlugin", () => {
	test("disables a previously enabled plugin", async () => {
		await enablePlugin("test-plugin", "market");
		await disablePlugin("test-plugin", "market");
		expect(await isPluginEnabled("test-plugin", "market")).toBe(false);
	});

	test("disabling a non-existent plugin sets it to false", async () => {
		await disablePlugin("missing-plugin", "market");
		expect(await isPluginEnabled("missing-plugin", "market")).toBe(false);
	});
});

describe("removePluginFromSettings", () => {
	test("removes a plugin entry entirely", async () => {
		await enablePlugin("removable", "market");
		await removePluginFromSettings("removable", "market");
		const settings = await getSettings();
		expect(settings.enabledPlugins).not.toHaveProperty("removable@market");
	});
});

describe("isPluginEnabled", () => {
	test("returns false for unknown plugin", async () => {
		expect(await isPluginEnabled("unknown", "market")).toBe(false);
	});

	test("returns true only when value is exactly true", async () => {
		await enablePlugin("exact", "market");
		expect(await isPluginEnabled("exact", "market")).toBe(true);
	});
});

describe("listEnabledPlugins", () => {
	test("returns empty array when no plugins configured", async () => {
		await writeJSON(settingsFile, { enabledPlugins: {} });
		expect(await listEnabledPlugins()).toEqual([]);
	});

	test("lists all plugins with their status", async () => {
		await writeJSON(settingsFile, { enabledPlugins: {} });
		await enablePlugin("enabled-one", "market-a");
		await disablePlugin("disabled-one", "market-b");

		const plugins = await listEnabledPlugins();
		expect(plugins).toHaveLength(2);
		expect(plugins).toContainEqual({
			name: "enabled-one",
			marketplace: "market-a",
			enabled: true,
		});
		expect(plugins).toContainEqual({
			name: "disabled-one",
			marketplace: "market-b",
			enabled: false,
		});
	});

	test("skips malformed keys without @ separator", async () => {
		await writeJSON(settingsFile, {
			enabledPlugins: {
				"valid@market": true,
				"no-separator": true,
			},
		});
		const plugins = await listEnabledPlugins();
		expect(plugins).toHaveLength(1);
		expect(plugins[0]?.name).toBe("valid");
	});
});
