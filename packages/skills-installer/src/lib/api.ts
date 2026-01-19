import type { SearchResponse } from "../types.js";

const REGISTRY_API_URL = process.env.SKILLS_REGISTRY_URL || "https://api.claude-plugins.dev";

/**
 * Resolved skill from the unified resolve API
 */
export interface ResolvedSkill {
	namespace: string;
	name: string;
	relDir: string;
	sourceUrl: string;
}

/**
 * Response from the unified resolve API
 */
export interface ResolveResponse {
	status: "success" | "error";
	query: {
		target: string;
		kind: "owner" | "repo" | "skill";
		normalized: string;
	};
	skills: ResolvedSkill[];
	page: {
		limit: number;
		offset: number;
		hasMore: boolean;
		total: number;
	};
	error?: string;
}

/**
 * Resolve skills from registry API using unified endpoint
 * Handles: owner, owner/repo, owner/repo/skill, and GitHub URLs
 */
export const resolveTarget = async (
	target: string,
	options?: { limit?: number; offset?: number },
): Promise<ResolveResponse> => {
	const url = `${REGISTRY_API_URL}/api/v2/skills/resolve`;

	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"User-Agent": "skills-installer/0.1.0",
		},
		body: JSON.stringify({
			target,
			limit: options?.limit ?? 100,
			offset: options?.offset ?? 0,
		}),
	});

	if (!response.ok) {
		const data = await response.json().catch(() => ({})) as { error?: string };
		throw new Error(data.error || `Failed to resolve: ${response.statusText}`);
	}

	const data = (await response.json()) as ResolveResponse;

	if (data.status === "error") {
		throw new Error(data.error || "Failed to resolve target");
	}

	return data;
};

/**
 * Track installation analytics (fire-and-forget)
 * Uses namespace format: @owner/repo/skill
 */
export const trackInstallation = async (namespace: string): Promise<void> => {
	try {
		// Parse namespace: @owner/repo/skill -> owner/repo/skill
		const parts = namespace.replace(/^@/, "").split("/");
		if (parts.length !== 3) return;

		const [owner, repo, skillName] = parts;
		const url = `${REGISTRY_API_URL}/api/skills/${owner}/${repo}/${skillName}/install`;
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
