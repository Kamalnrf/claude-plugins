import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { extractPluginMetadata } from "./plugin";

let tempDir: string;

beforeEach(async () => {
	tempDir = await mkdtemp(join(tmpdir(), "plugin-test-"));
});

afterEach(async () => {
	await rm(tempDir, { recursive: true, force: true });
});

describe("extractPluginMetadata", () => {
	test("extracts metadata from marketplace.json with plugins array", async () => {
		const pluginDir = join(tempDir, "my-plugin");
		const metaDir = join(pluginDir, ".claude-plugin");
		await mkdir(metaDir, { recursive: true });

		const marketplace = {
			plugins: [
				{
					name: "my-plugin",
					description: "A test plugin",
					version: "1.0.0",
					author: { name: "Test Author" },
				},
				{
					name: "other-plugin",
					description: "Another plugin",
					version: "2.0.0",
					author: { name: "Other" },
				},
			],
		};
		await writeFile(
			join(metaDir, "marketplace.json"),
			JSON.stringify(marketplace),
		);

		const result = await extractPluginMetadata(pluginDir, "my-plugin");
		expect(result.name).toBe("my-plugin");
		expect(result.description).toBe("A test plugin");
		expect(result.source).toEqual({ source: "directory", path: pluginDir });
	});

	test("uses first plugin if name not found in plugins array", async () => {
		const pluginDir = join(tempDir, "fallback-plugin");
		const metaDir = join(pluginDir, ".claude-plugin");
		await mkdir(metaDir, { recursive: true });

		const marketplace = {
			plugins: [
				{
					name: "first-plugin",
					description: "First",
					version: "1.0.0",
					author: { name: "Author" },
				},
			],
		};
		await writeFile(
			join(metaDir, "marketplace.json"),
			JSON.stringify(marketplace),
		);

		const result = await extractPluginMetadata(pluginDir, "nonexistent");
		expect(result.name).toBe("first-plugin");
	});

	test("handles single plugin definition in marketplace.json", async () => {
		const pluginDir = join(tempDir, "single-plugin");
		const metaDir = join(pluginDir, ".claude-plugin");
		await mkdir(metaDir, { recursive: true });

		const pluginData = {
			description: "Single plugin",
			version: "1.0.0",
			author: { name: "Solo Author" },
		};
		await writeFile(
			join(metaDir, "marketplace.json"),
			JSON.stringify(pluginData),
		);

		const result = await extractPluginMetadata(pluginDir, "solo");
		expect(result.name).toBe("solo");
		expect(result.description).toBe("Single plugin");
		expect(result.source.source).toBe("directory");
	});

	test("falls back to plugin.json when marketplace.json missing", async () => {
		const pluginDir = join(tempDir, "plugin-json");
		const metaDir = join(pluginDir, ".claude-plugin");
		await mkdir(metaDir, { recursive: true });

		await writeFile(
			join(metaDir, "plugin.json"),
			JSON.stringify({
				description: "From plugin.json",
				version: "0.1.0",
			}),
		);

		const result = await extractPluginMetadata(pluginDir, "fallback");
		expect(result.name).toBe("fallback");
		expect(result.description).toBe("From plugin.json");
	});

	test("returns minimal metadata when no metadata files exist", async () => {
		const pluginDir = join(tempDir, "bare-plugin");
		await mkdir(pluginDir, { recursive: true });

		const result = await extractPluginMetadata(pluginDir, "bare");
		expect(result.name).toBe("bare");
		expect(result.description).toContain("no metadata available");
		expect(result.version).toBe("1.0.0");
		expect(result.author).toEqual({ name: "Unknown" });
		expect(result.source).toEqual({ source: "directory", path: pluginDir });
	});
});
