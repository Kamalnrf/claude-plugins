import { homedir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import { getClientConfig } from "./client-config";

describe("client config", () => {
	test("shared installs globally to ~/.agents/skills", () => {
		expect(getClientConfig("shared")?.globalDir).toBe(
			join(homedir(), ".agents", "skills"),
		);
	});

	test("shared installs locally to the project .agents/skills directory", () => {
		expect(getClientConfig("shared")?.localDir).toBe(
			join(process.cwd(), ".agents", "skills"),
		);
	});

	test("shared aliases use the shared .agents/skills config", () => {
		expect(getClientConfig("codex")).toBe(getClientConfig("shared"));
	});
});
