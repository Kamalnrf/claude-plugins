import { test, expect } from "bun:test";
import { resolvePluginUrl, extractPluginName } from "./resolver";

test("resolves @namespace/plugin format", () => {
  const url = resolvePluginUrl("@wshobson/claude-code-essentials");
  expect(url).toBe("https://github.com/wshobson/agents.git");
});

test("resolves namespace/plugin format to GitHub URL", () => {
  const url = resolvePluginUrl("davila7/claude-code-templates");
  expect(url).toBe("https://github.com/davila7/claude-code-templates.git");
});

test("passes through direct URLs", () => {
  const url = resolvePluginUrl("https://github.com/test/plugin.git");
  expect(url).toBe("https://github.com/test/plugin.git");
});

test("returns null for unknown @namespace/plugin", () => {
  const url = resolvePluginUrl("@unknown/nonexistent-plugin");
  expect(url).toBeNull();
});

test("extracts plugin name from @namespace/plugin", () => {
  const name = extractPluginName("@wshobson/claude-code-essentials");
  expect(name).toBe("claude-code-essentials");
});

test("extracts plugin name from namespace/plugin", () => {
  const name = extractPluginName("davila7/claude-code-templates");
  expect(name).toBe("claude-code-templates");
});

test("extracts plugin name from URL", () => {
  const name = extractPluginName("https://github.com/test/my-plugin.git");
  expect(name).toBe("my-plugin");
});

test("handles plain plugin name", () => {
  const name = extractPluginName("simple-plugin");
  expect(name).toBe("simple-plugin");
});
