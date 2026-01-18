import type { SkillIdentifier } from "../types.js";

export interface RepoSpec {
	original: string;
	cloneUrl: string;
	provider: "github";
	owner: string;
	repo: string;
	ref?: string;
}

export type InstallTarget =
	| { kind: "registry-skill"; identifier: SkillIdentifier }
	| { kind: "git-repo"; repo: RepoSpec }
	| { kind: "git-skill-path"; repo: RepoSpec; subdir: string };

/**
 * Parse GitHub SSH URL: git@github.com:owner/repo.git
 */
const parseSSHUrl = (input: string): RepoSpec | null => {
	const match = input.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/i);
	if (!match) return null;

	const [, owner, repo] = match;
	return {
		original: input,
		cloneUrl: input.endsWith(".git") ? input : `${input}.git`,
		provider: "github",
		owner: owner!,
		repo: repo!.replace(/\.git$/, ""),
	};
};

/**
 * Parse GitHub HTTPS URL with optional /tree/ref/path
 * Handles:
 * - https://github.com/owner/repo
 * - github.com/owner/repo
 * - https://github.com/owner/repo/tree/main
 * - https://github.com/owner/repo/tree/main/skills/frontend-design
 */
const parseGitHubUrl = (
	input: string,
): { repo: RepoSpec; subdir?: string } | null => {
	const withoutProtocol = input.replace(/^https?:\/\//i, "");
	if (!withoutProtocol.toLowerCase().startsWith("github.com/")) {
		return null;
	}

	const afterHost = withoutProtocol.replace(/^github\.com\/?/i, "");
	const segments = afterHost.split("/").filter(Boolean);

	if (segments.length < 2) return null;

	const owner = segments[0]!;
	const repo = segments[1]!.replace(/\.git$/, "");

	const base: RepoSpec = {
		original: input,
		cloneUrl: `https://github.com/${owner}/${repo}.git`,
		provider: "github",
		owner,
		repo,
	};

	// Check for /tree/<ref>/... pattern
	if (segments[2] === "tree" && segments[3]) {
		const ref = segments[3];
		const pathParts = segments.slice(4);

		base.ref = ref;

		if (pathParts.length > 0) {
			const subdir = pathParts.join("/").replace(/\/SKILL\.md$/i, "");
			return { repo: base, subdir: subdir || undefined };
		}
	}

	return { repo: base };
};

/**
 * Parse shorthand owner/repo format
 */
const parseShorthand = (input: string): RepoSpec | null => {
	// Must be exactly owner/repo without extra paths
	if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(input)) {
		return null;
	}

	const [owner, repo] = input.split("/");
	return {
		original: input,
		cloneUrl: `https://github.com/${owner}/${repo}.git`,
		provider: "github",
		owner: owner!,
		repo: repo!,
	};
};

/**
 * Check if input is a registry skill identifier (@owner/repo/skill)
 * Must NOT start with github.com or contain other URL patterns
 */
const isRegistryIdentifier = (input: string): boolean => {
	// Must have exactly 3 segments
	if (!/^@?[^/]+\/[^/]+\/[^/]+$/.test(input)) {
		return false;
	}
	// Must not look like a URL
	const lower = input.toLowerCase();
	if (
		lower.startsWith("github.com") ||
		lower.includes(".git") ||
		lower.includes("://")
	) {
		return false;
	}
	return true;
};

/**
 * Parse registry skill identifier
 */
const parseRegistryIdentifier = (input: string): SkillIdentifier => {
	const normalized = input.startsWith("@") ? input.slice(1) : input;
	const parts = normalized.split("/");

	if (parts.length !== 3) {
		throw new Error(
			`Invalid format: ${input}\n` +
				`Expected: @owner/repo/skill-name\n` +
				`Example: @anthropic/claude-cookbooks/analyzing-financial-statements`,
		);
	}

	return {
		owner: parts[0]!,
		repo: parts[1]!,
		skillName: parts[2]!,
	};
};

/**
 * Detect if input looks like a Git URL (not a registry identifier)
 */
const looksLikeGitUrl = (input: string): boolean => {
	return (
		input.startsWith("http://") ||
		input.startsWith("https://") ||
		input.startsWith("git@") ||
		input.toLowerCase().startsWith("github.com/") ||
		// Shorthand: exactly owner/repo (no @ prefix, exactly 2 segments)
		/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(input)
	);
};

/**
 * Parse install target from user input
 * Determines if input is:
 * - A registry skill identifier (@owner/repo/skill)
 * - A Git repo URL/shorthand (clone + discover skills)
 * - A direct path to a skill in a repo
 */
export const parseInstallTarget = (input: string): InstallTarget => {
	// Registry identifier: @owner/repo/skill or owner/repo/skill (3 parts)
	if (isRegistryIdentifier(input)) {
		return {
			kind: "registry-skill",
			identifier: parseRegistryIdentifier(input),
		};
	}

	// Git URL detection
	if (!looksLikeGitUrl(input)) {
		throw new Error(
			`Invalid input: ${input}\n\n` +
				`Supported formats:\n` +
				`  @owner/repo/skill-name   Registry skill\n` +
				`  owner/repo               GitHub repo (shorthand)\n` +
				`  github.com/owner/repo    GitHub repo URL\n` +
				`  https://github.com/owner/repo/tree/main/skills/skill-name   Direct path`,
		);
	}

	// Try SSH format first
	const sshResult = parseSSHUrl(input);
	if (sshResult) {
		return { kind: "git-repo", repo: sshResult };
	}

	// Try GitHub HTTPS URL
	const githubResult = parseGitHubUrl(input);
	if (githubResult) {
		if (githubResult.subdir) {
			return {
				kind: "git-skill-path",
				repo: githubResult.repo,
				subdir: githubResult.subdir,
			};
		}
		return { kind: "git-repo", repo: githubResult.repo };
	}

	// Try shorthand
	const shorthand = parseShorthand(input);
	if (shorthand) {
		return { kind: "git-repo", repo: shorthand };
	}

	throw new Error(
		`Could not parse Git URL: ${input}\n\n` +
			`Supported formats:\n` +
			`  owner/repo               GitHub repo (shorthand)\n` +
			`  github.com/owner/repo    GitHub repo URL\n` +
			`  git@github.com:owner/repo.git   SSH URL`,
	);
};
