import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { hasSkillMd, validateSkillMd } from "./validate";

let tempDir: string;

beforeEach(async () => {
	tempDir = await mkdtemp(join(tmpdir(), "validate-test-"));
});

afterEach(async () => {
	await rm(tempDir, { recursive: true, force: true });
});

describe("hasSkillMd", () => {
	test("returns true when SKILL.md exists", async () => {
		const skillDir = join(tempDir, "has-skill");
		await mkdir(skillDir, { recursive: true });
		await writeFile(join(skillDir, "SKILL.md"), "# Skill");
		expect(hasSkillMd(skillDir)).toBe(true);
	});

	test("returns false when SKILL.md does not exist", () => {
		expect(hasSkillMd(join(tempDir, "no-skill"))).toBe(false);
	});

	test("returns false for empty directory", async () => {
		const emptyDir = join(tempDir, "empty");
		await mkdir(emptyDir);
		expect(hasSkillMd(emptyDir)).toBe(false);
	});
});

describe("validateSkillMd", () => {
	test("returns true for SKILL.md with content", async () => {
		const skillDir = join(tempDir, "valid");
		await mkdir(skillDir, { recursive: true });
		await writeFile(join(skillDir, "SKILL.md"), "# My Skill\nSome content");
		expect(await validateSkillMd(skillDir)).toBe(true);
	});

	test("returns false when SKILL.md does not exist", async () => {
		expect(await validateSkillMd(join(tempDir, "missing"))).toBe(false);
	});

	test("returns false for empty SKILL.md", async () => {
		const skillDir = join(tempDir, "empty-md");
		await mkdir(skillDir, { recursive: true });
		await writeFile(join(skillDir, "SKILL.md"), "");
		expect(await validateSkillMd(skillDir)).toBe(false);
	});

	test("returns false for whitespace-only SKILL.md", async () => {
		const skillDir = join(tempDir, "whitespace");
		await mkdir(skillDir, { recursive: true });
		await writeFile(join(skillDir, "SKILL.md"), "   \n  \t  ");
		expect(await validateSkillMd(skillDir)).toBe(false);
	});

	test("returns true for SKILL.md with minimal content", async () => {
		const skillDir = join(tempDir, "minimal");
		await mkdir(skillDir, { recursive: true });
		await writeFile(join(skillDir, "SKILL.md"), "x");
		expect(await validateSkillMd(skillDir)).toBe(true);
	});
});
