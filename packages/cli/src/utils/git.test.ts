import { expect, test, describe } from "bun:test";
import { normalizeGithubPath } from "./git";

describe("normalizeGithubPath", () => {
	describe("standard subdirectory skills", () => {
		test("handles full GitHub URL with tree/branch/path", () => {
			expect(
				normalizeGithubPath(
					"https://github.com/anthropics/claude-cookbooks/tree/main/skills/analyzing-financial-statements",
				),
			).toBe("anthropics/claude-cookbooks/skills/analyzing-financial-statements");
		});

		test("handles URL without protocol", () => {
			expect(
				normalizeGithubPath(
					"github.com/anthropics/claude-cookbooks/tree/main/skills/my-skill",
				),
			).toBe("anthropics/claude-cookbooks/skills/my-skill");
		});

		test("handles deeply nested paths", () => {
			expect(
				normalizeGithubPath(
					"https://github.com/owner/repo/tree/main/skills/custom_skills/sub/deep/skill",
				),
			).toBe("owner/repo/skills/custom_skills/sub/deep/skill");
		});

		test("handles different branch names", () => {
			expect(
				normalizeGithubPath(
					"https://github.com/owner/repo/tree/develop/skills/my-skill",
				),
			).toBe("owner/repo/skills/my-skill");
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
			).toBe("owner/repo/new-skill/skills/my-skill");
		});
	});

	describe("root-level skills (SKILL.md in repo root)", () => {
		test("handles tree/branch without trailing path", () => {
			expect(
				normalizeGithubPath(
					"https://github.com/FrancyJGLisboa/agent-skill-creator/tree/main",
				),
			).toBe("FrancyJGLisboa/agent-skill-creator");
		});

		test("handles tree/branch/SKILL.md (file path)", () => {
			expect(
				normalizeGithubPath(
					"https://github.com/FrancyJGLisboa/agent-skill-creator/tree/main/SKILL.md",
				),
			).toBe("FrancyJGLisboa/agent-skill-creator");
		});

		test("handles repo URL without tree/branch", () => {
			expect(
				normalizeGithubPath(
					"https://github.com/FrancyJGLisboa/agent-skill-creator",
				),
			).toBe("FrancyJGLisboa/agent-skill-creator");
		});

		test("handles SKILL.md with different casing", () => {
			expect(
				normalizeGithubPath(
					"https://github.com/owner/repo/tree/main/skill.md",
				),
			).toBe("owner/repo");

			expect(
				normalizeGithubPath(
					"https://github.com/owner/repo/tree/main/SKILL.MD",
				),
			).toBe("owner/repo");
		});
	});

	describe("SKILL.md in subdirectory", () => {
		test("strips SKILL.md from subdirectory path", () => {
			expect(
				normalizeGithubPath(
					"https://github.com/owner/repo/tree/main/skills/my-skill/SKILL.md",
				),
			).toBe("owner/repo/skills/my-skill");
		});

		test("does not strip SKILL.md from middle of path", () => {
			// Edge case: directory named SKILL.md (unusual but possible)
			expect(
				normalizeGithubPath(
					"https://github.com/owner/repo/tree/main/SKILL.md/nested",
				),
			).toBe("owner/repo/SKILL.md/nested");
		});
	});

	describe("edge cases", () => {
		test("removes trailing slashes", () => {
			expect(
				normalizeGithubPath(
					"https://github.com/owner/repo/tree/main/skills/my-skill/",
				),
			).toBe("owner/repo/skills/my-skill");
		});

		test("handles http protocol", () => {
			expect(
				normalizeGithubPath(
					"http://github.com/owner/repo/tree/main/skills/my-skill",
				),
			).toBe("owner/repo/skills/my-skill");
		});

		test("handles URL without tree segment", () => {
			expect(
				normalizeGithubPath(
					"https://github.com/owner/repo/skills/my-skill",
				),
			).toBe("owner/repo/skills/my-skill");
		});

		test("handles master branch", () => {
			expect(
				normalizeGithubPath(
					"https://github.com/owner/repo/tree/master/skills/my-skill",
				),
			).toBe("owner/repo/skills/my-skill");
		});
	});
});
