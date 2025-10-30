/**
 * Claude Plugins Registry API - Skills
 * Production API deployed on Val Town
 */
const REGISTRY_API_URL = "https://api.claude-plugins.dev";

export interface SkillInfo {
	name: string;
	namespace: string;
	sourceUrl: string;
	description: string;
	version?: string;
	author: string;
}

/**
 * Resolves a skill identifier to skill info by querying the registry API
 * Supports npm-style package names:
 * - @owner/repo/skill (scoped)
 *
 * @param skillIdentifier Skill identifier in format: @owner/repo/skill or owner/repo/skill
 * @returns SkillInfo if resolved, null if unable to resolve
 */
export async function resolveSkill(
	skillIdentifier: string,
): Promise<SkillInfo | null> {
	try {
		const parts = skillIdentifier.split("/");
		if (parts.length !== 3) {
			throw new Error(
				`Invalid skill identifier format. Expected: @owner/repo/skill or owner/repo/skill`,
			);
		}

		const [owner, marketplace, skillName] = parts;

		// Query the API
		const response = await fetch(
			`${REGISTRY_API_URL}/api/skills/${owner}/${marketplace}/${skillName}`,
		);

		if (!response.ok) {
			return null;
		}

		const data = (await response.json()) as SkillInfo;
		if (!data.sourceUrl) {
			throw new Error("Invalid response from registry API: missing sourceUrl");
		}

		return data;
	} catch (error) {
		return null;
	}
}

/**
 * Extracts the skill name from a skill identifier
 * - @owner/repo/skill -> skill
 *
 * @param skillIdentifier Skill identifier
 * @returns Skill name (last part after /)
 */
export function extractSkillName(skillIdentifier: string): string {
	return skillIdentifier.split("/").pop()!;
}

/**
 * Parses a skill namespace into its components
 * @param skillIdentifier Skill identifier in format: @owner/repo/skill or owner/repo/skill
 * @returns Object with owner, marketplace (repo), and skillName
 */
export function parseSkillNamespace(skillIdentifier: string): {
	owner: string;
	marketplace: string;
	skillName: string;
} {
  const parts = skillIdentifier.split("/");
	if (parts.length !== 3) {
		throw new Error(
			"Invalid skill identifier format. Expected: @owner/repo/skill or owner/repo/skill",
		);
	}

	return {
		owner: parts[0] ?? '',
		marketplace: parts[1] ?? '',
		skillName: parts[2] ?? '',
	};
}
