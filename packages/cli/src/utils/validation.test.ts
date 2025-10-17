import { expect, test } from "bun:test";
import { isValidPluginIdentifier } from "./validation";

test("validates @namespace/plugin format", () => {
	expect(isValidPluginIdentifier("@wshobson/claude-code-essentials")).toBe(
		true,
	);
});

test("validates namespace/plugin format", () => {
	expect(isValidPluginIdentifier("davila7/claude-code-templates")).toBe(true);
});

test("rejects URLs (not supported)", () => {
	expect(isValidPluginIdentifier("https://github.com/test/plugin.git")).toBe(
		false,
	);
	expect(isValidPluginIdentifier("http://example.com/repo.git")).toBe(false);
});

test("validates simple names", () => {
	expect(isValidPluginIdentifier("simple-plugin")).toBe(true);
});

test("rejects empty strings", () => {
	expect(isValidPluginIdentifier("")).toBe(false);
	expect(isValidPluginIdentifier("   ")).toBe(false);
});

test("rejects malformed identifiers", () => {
	expect(isValidPluginIdentifier("@namespace/")).toBe(false);
	expect(isValidPluginIdentifier("/plugin")).toBe(false);
});
