import { test, expect } from "bun:test";
import { resolvePluginUrl, extractPluginName } from "./resolver";

test("resolves @namespace/plugin format from API", async () => {
  // Using actual plugin in registry
  const url = await resolvePluginUrl("@every-marketplace/compounding-engineering");
  expect(url).toBe("https://github.com/EveryInc/every-marketplace.git");
});

test("resolves namespace/plugin format without @ from API", async () => {
  // Using actual plugin in registry
  const url = await resolvePluginUrl("every-marketplace/compounding-engineering");
  expect(url).toBe("https://github.com/EveryInc/every-marketplace.git");
});

test("returns null for URLs (not supported)", async () => {
  const url = await resolvePluginUrl("https://github.com/test/plugin.git");
  expect(url).toBe(null);
});

test("returns null for plugins not in registry", async () => {
  const url = await resolvePluginUrl("unknown/nonexistent-plugin");
  // No fallback - must be in registry
  expect(url).toBe(null);
});

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
