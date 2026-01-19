import type { SkillIdentifier, SkillMetadata, SearchResponse } from "../types.js";

const REGISTRY_API_URL = "https://api.claude-plugins.dev";

/**
 * Parse skill identifier from format: @owner/repo/skill-name
 * Pure function - no side effects
 */
export const parseSkillIdentifier = (input: string): SkillIdentifier => {
	const parts = input.split("/");

	if (parts.length !== 3) {
		throw new Error(
			`Invalid format: ${input}\n` +
				`Expected: @owner/repo/skill-name\n` +
				`Example: @anthropic/claude-cookbooks/analyzing-financial-statements`,
		);
	}

	const [owner, repo, skillName] = parts;

	return {
		owner: owner ?? "",
		repo: repo ?? "",
		skillName: skillName ?? "",
	};
};

/**
 * Resolve skill from registry API
 * Returns skill metadata if found, null otherwise
 */
export const resolveSkill = async (
	identifier: SkillIdentifier,
): Promise<SkillMetadata | null> => {
	try {
		const url = `${REGISTRY_API_URL}/api/skills/${identifier.owner}/${identifier.repo}/${identifier.skillName}`;

		const response = await fetch(url, {
			headers: { "User-Agent": "skills-installer/0.1.0" },
		});

		if (!response.ok) {
			return null;
		}

		const data = (await response.json()) as SkillMetadata;

		if (!data.sourceUrl) {
			throw new Error("Invalid response: missing sourceUrl");
		}

		return data;
	} catch (error) {
		return null;
	}
};

/**
 * Track installation analytics (fire-and-forget)
 */
export const trackInstallation = async (
	identifier: SkillIdentifier,
): Promise<void> => {
	try {
		const url = `${REGISTRY_API_URL}/api/skills/${identifier.owner}/${identifier.repo}/${identifier.skillName}/install`;
		await fetch(url, { method: "POST" });
	} catch {
		// ignore tracking failures
	}
};

export interface SearchParams {
	query: string;
	limit?: number;
	offset?: number;
	orderBy?: "downloads" | "stars";
	order?: "asc" | "desc";
}

/**
 * Skill info returned from the index endpoint
 */
export interface IndexedSkill {
	namespace: string;
	skillName: string;
	name: string;
	description: string;
	relDir: string;
	sourceUrl: string;
	status: "indexed" | "unchanged" | "invalid" | "skipped" | "failed";
}

/**
 * Response from the index endpoint
 */
export interface IndexRepoResponse {
	ok: boolean;
	repo: string;
	defaultBranch: string;
	pathsFound: number;
	result: {
		found: number;
		indexed: number;
		skills: IndexedSkill[];
	};
	error?: string;
}

/**
 * Index a repository and return discovered skills
 * Used for git URL installs to discover available skills
 */
export const indexRepoAndListSkills = async (
	repo: string,
): Promise<IndexRepoResponse> => {
	const url = `${REGISTRY_API_URL}/api/skills/index`;
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"User-Agent": "skills-installer/0.1.0",
		},
		body: JSON.stringify({ repo, dryRun: false }),
	});

	if (!response.ok) {
		const data = await response.json().catch(() => ({}));
		throw new Error(data.error || `Failed to index repository: ${response.statusText}`);
	}

	const data = await response.json() as IndexRepoResponse;

	if (!data.ok) {
		throw new Error(data.error || "Failed to index repository");
	}

	return data;
};

/**
 * Search for skills in the registry
 * Returns search results with pagination info
 */
export const searchSkills = async (params: SearchParams): Promise<SearchResponse> => {
	const { query, limit = 10, offset = 0, orderBy, order } = params;

	const url = new URL(`${REGISTRY_API_URL}/api/skills/search`);
	url.searchParams.set("q", query);
	url.searchParams.set("limit", String(limit));
	url.searchParams.set("offset", String(offset));

	// Add sort parameters if specified (relevance = no params)
	if (orderBy) {
		url.searchParams.set("orderBy", orderBy);
		url.searchParams.set("order", order ?? "desc");
	}

	const response = await fetch(url.toString(), {
		headers: { "User-Agent": "skills-installer/0.1.0" },
	});

	if (!response.ok) {
		throw new Error(`Search failed: ${response.statusText}`);
	}

	return response.json() as Promise<SearchResponse>;
};
