import { expect, test, describe } from "bun:test";
import { normalizeGithubPath } from "./download";

describe("normalizeGithubPath", () => {
	describe("standard subdirectory skills", () => {
		test("handles full GitHub URL with tree/branch/path", () => {
			expect(
				normalizeGithubPath(
					"https://github.com/anthropics/claude-cookbooks/tree/main/skills/analyzing-financial-statements",
				),
			).toEqual({
				path: "anthropics/claude-cookbooks/skills/analyzing-financial-statements",
				branch: "main",
			});
		});

		test("handles URL without protocol", () => {
			expect(
				normalizeGithubPath(
					"github.com/anthropics/claude-cookbooks/tree/main/skills/my-skill",
				),
			).toEqual({
				path: "anthropics/claude-cookbooks/skills/my-skill",
				branch: "main",
			});
		});

		test("handles deeply nested paths", () => {
			expect(
				normalizeGithubPath(
					"https://github.com/owner/repo/tree/main/skills/custom_skills/sub/deep/skill",
				),
			).toEqual({
				path: "owner/repo/skills/custom_skills/sub/deep/skill",
				branch: "main",
			});
		});

		test("handles different branch names", () => {
			expect(
				normalizeGithubPath(
					"https://github.com/owner/repo/tree/develop/skills/my-skill",
				),
			).toEqual({
				path: "owner/repo/skills/my-skill",
				branch: "develop",
			});
		});

		test("handles branch names with slashes (limited support)", () => {
			// Note: Branch names with slashes have limited support.
			// The regex can't distinguish between branch path and skill path
			// e.g., "feature/new-skill" branch vs "feature" branch with "new-skill" in path
			// This is acceptable as most skills use simple branch names (main, master, develop)
			expect(
				normalizeGithubPath(
					"https://github.com/owner/repo/tree/feature/new-skill/skills/my-skill",
				),
			).toEqual({
				path: "owner/repo/new-skill/skills/my-skill",
				branch: "feature",
			});
		});
	});

	describe("root-level skills (SKILL.md in repo root)", () => {
		test("handles tree/branch without trailing path", () => {
			expect(
				normalizeGithubPath(
					"https://github.com/FrancyJGLisboa/agent-skill-creator/tree/main",
				),
			).toEqual({
				path: "FrancyJGLisboa/agent-skill-creator",
				branch: "main",
			});
		});

		test("handles tree/branch/SKILL.md (file path)", () => {
			expect(
				normalizeGithubPath(
					"https://github.com/FrancyJGLisboa/agent-skill-creator/tree/main/SKILL.md",
				),
			).toEqual({
				path: "FrancyJGLisboa/agent-skill-creator",
				branch: "main",
			});
		});

		test("handles repo URL without tree/branch", () => {
			expect(
				normalizeGithubPath(
					"https://github.com/FrancyJGLisboa/agent-skill-creator",
				),
			).toEqual({
				path: "FrancyJGLisboa/agent-skill-creator",
				branch: undefined,
			});
		});

		test("handles SKILL.md with different casing", () => {
			expect(
				normalizeGithubPath(
					"https://github.com/owner/repo/tree/main/skill.md",
				),
			).toEqual({
				path: "owner/repo",
				branch: "main",
			});

			expect(
				normalizeGithubPath(
					"https://github.com/owner/repo/tree/main/SKILL.MD",
				),
			).toEqual({
				path: "owner/repo",
				branch: "main",
			});
		});
	});

	describe("SKILL.md in subdirectory", () => {
		test("strips SKILL.md from subdirectory path", () => {
			expect(
				normalizeGithubPath(
					"https://github.com/owner/repo/tree/main/skills/my-skill/SKILL.md",
				),
			).toEqual({
				path: "owner/repo/skills/my-skill",
				branch: "main",
			});
		});

		test("does not strip SKILL.md from middle of path", () => {
			// Edge case: directory named SKILL.md (unusual but possible)
			expect(
				normalizeGithubPath(
					"https://github.com/owner/repo/tree/main/SKILL.md/nested",
				),
			).toEqual({
				path: "owner/repo/SKILL.md/nested",
				branch: "main",
			});
		});
	});

	describe("edge cases", () => {
		test("removes trailing slashes", () => {
			expect(
				normalizeGithubPath(
					"https://github.com/owner/repo/tree/main/skills/my-skill/",
				),
			).toEqual({
				path: "owner/repo/skills/my-skill",
				branch: "main",
			});
		});

		test("handles http protocol", () => {
			expect(
				normalizeGithubPath(
					"http://github.com/owner/repo/tree/main/skills/my-skill",
				),
			).toEqual({
				path: "owner/repo/skills/my-skill",
				branch: "main",
			});
		});

		test("handles URL without tree segment", () => {
			expect(
				normalizeGithubPath(
					"https://github.com/owner/repo/skills/my-skill",
				),
			).toEqual({
				path: "owner/repo/skills/my-skill",
				branch: undefined,
			});
		});

		test("handles master branch", () => {
			expect(
				normalizeGithubPath(
					"https://github.com/owner/repo/tree/master/skills/my-skill",
				),
			).toEqual({
				path: "owner/repo/skills/my-skill",
				branch: "master",
			});
		});
	});
});
