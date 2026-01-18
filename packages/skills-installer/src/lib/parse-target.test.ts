import { expect, test, describe } from "bun:test";
import { parseInstallTarget } from "./parse-target";

describe("parseInstallTarget", () => {
	describe("registry identifiers", () => {
		test("parses @owner/repo/skill format", () => {
			const result = parseInstallTarget("@anthropic/claude-cookbooks/financial-analysis");
			expect(result).toEqual({
				kind: "registry-skill",
				identifier: {
					owner: "anthropic",
					repo: "claude-cookbooks",
					skillName: "financial-analysis",
				},
			});
		});

		test("parses owner/repo/skill format (without @)", () => {
			const result = parseInstallTarget("anthropic/claude-cookbooks/financial-analysis");
			expect(result).toEqual({
				kind: "registry-skill",
				identifier: {
					owner: "anthropic",
					repo: "claude-cookbooks",
					skillName: "financial-analysis",
				},
			});
		});
	});

	describe("github shorthand", () => {
		test("parses owner/repo shorthand", () => {
			const result = parseInstallTarget("vercel-labs/agent-skills");
			expect(result).toEqual({
				kind: "git-repo",
				repo: {
					original: "vercel-labs/agent-skills",
					cloneUrl: "https://github.com/vercel-labs/agent-skills.git",
					provider: "github",
					owner: "vercel-labs",
					repo: "agent-skills",
				},
			});
		});

		test("handles underscores and dots in names", () => {
			const result = parseInstallTarget("owner_name/repo.name");
			expect(result.kind).toBe("git-repo");
			if (result.kind === "git-repo") {
				expect(result.repo.owner).toBe("owner_name");
				expect(result.repo.repo).toBe("repo.name");
			}
		});
	});

	describe("github HTTPS URLs", () => {
		test("parses simple repo URL", () => {
			const result = parseInstallTarget("https://github.com/vercel-labs/agent-skills");
			expect(result).toEqual({
				kind: "git-repo",
				repo: {
					original: "https://github.com/vercel-labs/agent-skills",
					cloneUrl: "https://github.com/vercel-labs/agent-skills.git",
					provider: "github",
					owner: "vercel-labs",
					repo: "agent-skills",
				},
			});
		});

		test("parses URL without protocol", () => {
			const result = parseInstallTarget("github.com/vercel-labs/agent-skills");
			expect(result.kind).toBe("git-repo");
		});

		test("parses URL with .git suffix", () => {
			const result = parseInstallTarget("https://github.com/owner/repo.git");
			expect(result.kind).toBe("git-repo");
			if (result.kind === "git-repo") {
				expect(result.repo.repo).toBe("repo");
				expect(result.repo.cloneUrl).toBe("https://github.com/owner/repo.git");
			}
		});

		test("parses URL with tree/branch only", () => {
			const result = parseInstallTarget("https://github.com/owner/repo/tree/main");
			expect(result).toEqual({
				kind: "git-repo",
				repo: {
					original: "https://github.com/owner/repo/tree/main",
					cloneUrl: "https://github.com/owner/repo.git",
					provider: "github",
					owner: "owner",
					repo: "repo",
					ref: "main",
				},
			});
		});
	});

	describe("direct skill paths", () => {
		test("parses URL with skill path", () => {
			const result = parseInstallTarget(
				"https://github.com/vercel-labs/agent-skills/tree/main/skills/frontend-design",
			);
			expect(result).toEqual({
				kind: "git-skill-path",
				repo: {
					original: "https://github.com/vercel-labs/agent-skills/tree/main/skills/frontend-design",
					cloneUrl: "https://github.com/vercel-labs/agent-skills.git",
					provider: "github",
					owner: "vercel-labs",
					repo: "agent-skills",
					ref: "main",
				},
				subdir: "skills/frontend-design",
			});
		});

		test("strips SKILL.md from path", () => {
			const result = parseInstallTarget(
				"https://github.com/owner/repo/tree/main/skills/my-skill/SKILL.md",
			);
			expect(result.kind).toBe("git-skill-path");
			if (result.kind === "git-skill-path") {
				expect(result.subdir).toBe("skills/my-skill");
			}
		});

		test("handles master branch", () => {
			const result = parseInstallTarget(
				"https://github.com/owner/repo/tree/master/skills/my-skill",
			);
			expect(result.kind).toBe("git-skill-path");
			if (result.kind === "git-skill-path") {
				expect(result.repo.ref).toBe("master");
			}
		});
	});

	describe("SSH URLs", () => {
		test("parses git@github.com:owner/repo.git", () => {
			const result = parseInstallTarget("git@github.com:vercel-labs/agent-skills.git");
			expect(result).toEqual({
				kind: "git-repo",
				repo: {
					original: "git@github.com:vercel-labs/agent-skills.git",
					cloneUrl: "git@github.com:vercel-labs/agent-skills.git",
					provider: "github",
					owner: "vercel-labs",
					repo: "agent-skills",
				},
			});
		});

		test("parses SSH URL without .git suffix", () => {
			const result = parseInstallTarget("git@github.com:owner/repo");
			expect(result.kind).toBe("git-repo");
			if (result.kind === "git-repo") {
				expect(result.repo.cloneUrl).toBe("git@github.com:owner/repo.git");
			}
		});
	});

	describe("error cases", () => {
		test("throws for invalid input", () => {
			expect(() => parseInstallTarget("not-a-valid-input")).toThrow();
		});

		test("throws for single segment", () => {
			expect(() => parseInstallTarget("just-one-segment")).toThrow();
		});
	});
});
