import { test, expect } from "bun:test";
import { resolvePluginUrl, extractPluginName } from "./resolver";

test("resolves @namespace/plugin format from API", async () => {
  const url = await resolvePluginUrl("@wshobson/claude-code-essentials");
  expect(url).toBe("https://github.com/wshobson/agents.git");
});

test("resolves @every/compounding-engineering from API", async () => {
  const url = await resolvePluginUrl("@every/compounding-engineering");
  expect(url).toBe("https://github.com/EveryInc/compounding-engineering-plugin.git");
});

test("passes through direct URLs without API call", async () => {
  const url = await resolvePluginUrl("https://github.com/test/plugin.git");
  expect(url).toBe("https://github.com/test/plugin.git");
});

test("falls back to GitHub for unknown namespace/plugin", async () => {
  const url = await resolvePluginUrl("unknown/nonexistent-plugin");
  // Should fallback to GitHub URL assumption when not found in registry
  expect(url).toBe("https://github.com/unknown/nonexistent-plugin.git");
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
