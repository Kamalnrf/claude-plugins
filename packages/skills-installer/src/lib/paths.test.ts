import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { getInstallDir, getSkillPath } from "./paths";
import type { ClientConfig } from "../types.js";

const makeConfig = (
	overrides: Partial<ClientConfig> = {},
): ClientConfig => ({
	name: "test-client",
	globalDir: "/home/user/.skills",
	localDir: "/project/.skills",
	...overrides,
});

describe("getInstallDir", () => {
	test("returns globalDir for global scope", () => {
		const config = makeConfig();
		expect(getInstallDir(config, "global")).toBe("/home/user/.skills");
	});

	test("returns localDir for local scope", () => {
		const config = makeConfig();
		expect(getInstallDir(config, "local")).toBe("/project/.skills");
	});

	test("falls back to localDir when globalDir is undefined and scope is global", () => {
		const config = makeConfig({ globalDir: undefined });
		expect(getInstallDir(config, "global")).toBe("/project/.skills");
	});
});

describe("getSkillPath", () => {
	test("joins install dir with skill name for global scope", () => {
		const config = makeConfig();
		expect(getSkillPath(config, "global", "my-skill")).toBe(
			join("/home/user/.skills", "my-skill"),
		);
	});

	test("joins install dir with skill name for local scope", () => {
		const config = makeConfig();
		expect(getSkillPath(config, "local", "my-skill")).toBe(
			join("/project/.skills", "my-skill"),
		);
	});

	test("handles skill names with special characters", () => {
		const config = makeConfig();
		expect(getSkillPath(config, "global", "@org/cool-skill")).toBe(
			join("/home/user/.skills", "@org/cool-skill"),
		);
	});
});
