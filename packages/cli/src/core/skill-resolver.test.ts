import { describe, expect, test } from "bun:test";
import { extractSkillName, parseSkillNamespace } from "./skill-resolver";

describe("extractSkillName", () => {
	test("extracts skill name from @owner/repo/skill", () => {
		expect(extractSkillName("@anthropics/claude-code/frontend-design")).toBe(
			"frontend-design",
		);
	});

	test("extracts skill name from owner/repo/skill", () => {
		expect(extractSkillName("anthropics/claude-code/frontend-design")).toBe(
			"frontend-design",
		);
	});

	test("extracts last segment from deeply nested path", () => {
		expect(extractSkillName("a/b/c/d/deep-skill")).toBe("deep-skill");
	});

	test("returns the identifier itself when no slashes", () => {
		expect(extractSkillName("standalone-skill")).toBe("standalone-skill");
	});

	test("handles trailing empty segment from trailing slash", () => {
		expect(extractSkillName("owner/repo/skill/")).toBe("");
	});
});

describe("parseSkillNamespace", () => {
	test("parses @owner/repo/skill correctly", () => {
		const result = parseSkillNamespace("@anthropics/claude-code/frontend-design");
		expect(result).toEqual({
			owner: "@anthropics",
			marketplace: "claude-code",
			skillName: "frontend-design",
		});
	});

	test("parses owner/repo/skill correctly", () => {
		const result = parseSkillNamespace("owner/repo/my-skill");
		expect(result).toEqual({
			owner: "owner",
			marketplace: "repo",
			skillName: "my-skill",
		});
	});

	test("throws for identifier with fewer than 3 parts", () => {
		expect(() => parseSkillNamespace("owner/repo")).toThrow(
			"Invalid skill identifier format",
		);
	});

	test("throws for identifier with more than 3 parts", () => {
		expect(() => parseSkillNamespace("a/b/c/d")).toThrow(
			"Invalid skill identifier format",
		);
	});

	test("throws for empty string", () => {
		expect(() => parseSkillNamespace("")).toThrow(
			"Invalid skill identifier format",
		);
	});

	test("throws for single segment", () => {
		expect(() => parseSkillNamespace("just-a-name")).toThrow(
			"Invalid skill identifier format",
		);
	});
});
