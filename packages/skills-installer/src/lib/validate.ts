import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Check if SKILL.md exists in the skill directory
 */
export const hasSkillMd = (skillPath: string): boolean =>
	existsSync(join(skillPath, "SKILL.md"));

/**
 * Validate that SKILL.md exists and has content
 */
export const validateSkillMd = async (skillPath: string): Promise<boolean> => {
	const skillMdPath = join(skillPath, "SKILL.md");

	if (!existsSync(skillMdPath)) {
		return false;
	}

	try {
		const content = await readFile(skillMdPath, "utf-8");
		return content.trim().length > 0;
	} catch {
		return false;
	}
};
