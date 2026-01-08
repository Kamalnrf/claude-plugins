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

/**
 * Search for skills in the registry
 * Returns search results with pagination info
 */
export const searchSkills = async (
	query: string,
	limit: number = 10,
	offset: number = 0,
): Promise<SearchResponse> => {
	const url = new URL(`${REGISTRY_API_URL}/api/skills/search`);
	url.searchParams.set("q", query);
	url.searchParams.set("limit", String(limit));
	url.searchParams.set("offset", String(offset));

	const response = await fetch(url.toString(), {
		headers: { "User-Agent": "skills-installer/0.1.0" },
	});

	if (!response.ok) {
		throw new Error(`Search failed: ${response.statusText}`);
	}

	return response.json() as Promise<SearchResponse>;
};
