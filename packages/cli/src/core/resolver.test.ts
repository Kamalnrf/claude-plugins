import { expect, test } from "bun:test";
import { extractPluginName } from "./resolver";

test("extracts plugin name from @namespace/plugin", () => {
	const name = extractPluginName("@wshobson/claude-code-essentials");
	expect(name).toBe("claude-code-essentials");
});

test("extracts plugin name from namespace/plugin", () => {
	const name = extractPluginName("davila7/claude-code-templates");
	expect(name).toBe("claude-code-templates");
});

test("handles unscoped plugin name", () => {
	const name = extractPluginName("simple-plugin");
	expect(name).toBe("simple-plugin");
});
