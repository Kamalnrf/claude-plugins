import { homedir } from "node:os";
import { join } from "node:path";
import { cancel, intro, note, outro, spinner } from "@clack/prompts";
import pc from "picocolors";
import { downloadTemplate} from 'giget'
import {
	extractSkillName,
	parseSkillNamespace,
	resolveSkill,
} from "../../core/skill-resolver";
import { normalizeGithubPath } from "../../utils/git";

const REGISTRY_API_URL = "https://api.claude-plugins.dev";

/**
 * Install a skill to either local (.claude/skills/) or global (~/.claude/skills/) directory
 * @param skillIdentifier Skill identifier in format: @owner/repo/skill or owner/repo/skill
 * @param isGlobal If true, install to ~/.claude/skills/, otherwise to .claude/skills/
 */
export async function skillInstallCommand(
	skillIdentifier: string,
	isLocal = false,
): Promise<void> {
	intro(pc.cyan("Claude Plugins - Skills"));

	// Step 1: Resolve skill from registry
	const s = spinner();
	s.start("Resolving skill from registry...");

	const skill = await resolveSkill(skillIdentifier);
	if (!skill) {
		s.stop("Failed to resolve");
		note(
			`Skill ${pc.cyan(skillIdentifier)} not found in the registry.\n\nVisit ${pc.blue(pc.underline("https://claude-plugins.dev/skills"))} to discover available skills.`,
			"Not Found",
		);
		cancel(`Unable to resolve "${skillIdentifier}"`);
		process.exit(1);
	}

	const skillName = extractSkillName(skillIdentifier);
	s.stop(`Resolved: ${skillName} ${pc.gray(`(${skill.sourceUrl})`)}`);

	// Step 2: Determine target directory
	const targetDir = !isLocal
		? join(homedir(), ".claude", "skills", skillName)
		: join(process.cwd(), ".claude", "skills", skillName);

	note(
		`Installing to: ${pc.dim(targetDir)}`,
	);

	// Step 3: Clone using gitpick
	try {
		s.start(`Installing ${skillName}...`);

		const {dir} = await downloadTemplate(`gh:${normalizeGithubPath(skill.sourceUrl)}`, {
		  dir: targetDir,
		})

		s.stop(`Skill cloned to ${dir}`);

		// Step 4: Track installation (fire-and-forget)
		const { owner, marketplace, skillName: name } =
			parseSkillNamespace(skillIdentifier);
		fetch(
			`${REGISTRY_API_URL}/api/skills/${owner}/${marketplace}/${name}/install`,
			{ method: "POST" },
		).catch((err) => console.error("Install tracking failed:", err));

		// Step 5: Success message
		note(
			`${pc.green("✓")} Skill "${skillName}" installed successfully!\n\n${!isLocal ? "Available for all Claude Code projects." : "Available for this project only."}`,
			"Installation Complete",
		);

		outro(pc.green("Done ✓"));
	} catch (error: any) {
		s.stop("Installation failed");

		const errorMessage =
			error.exitCode !== undefined
				? "failed to clone the skill"
				: error.message;

		note(
			`${pc.red("✗")} ${errorMessage}\n\nYou can try installing manually using:\n${pc.dim(`npx gitpick ${skill.sourceUrl} ${targetDir}`)}`,
			"Error",
		);

		cancel(`Installation failed: ${errorMessage}`);
		process.exit(1);
	}
}
