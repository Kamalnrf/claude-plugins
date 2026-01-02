import { exec } from "node:child_process";
import { promisify } from "node:util";
import { exists } from "./fs";

const execAsync = promisify(exec);

/**
 * Clones a git repository to the specified destination
 * @param url Git repository URL
 * @param destination Local path to clone into
 * @returns true if successful, false otherwise
 */
export async function cloneRepo(
	url: string,
	destination: string,
): Promise<boolean> {
	try {
		// Check if destination already exists
		if (await exists(destination)) {
			console.warn(`Destination ${destination} already exists, skipping clone`);
			return true;
		}

		// Clone with depth=1 for faster cloning (shallow clone)
		await execAsync(`git clone --depth 1 "${url}" "${destination}"`);
		return true;
	} catch (error) {
		console.error(`Failed to clone ${url}:`, error);
		return false;
	}
}

/**
 * Pulls latest changes from a git repository
 * @param repoPath Path to the local git repository
 * @returns true if successful, false otherwise
 */
export async function pullRepo(repoPath: string): Promise<boolean> {
	try {
		if (!(await exists(repoPath))) {
			console.warn(`Repository ${repoPath} does not exist`);
			return false;
		}

		await execAsync(`git -C "${repoPath}" pull`);
		return true;
	} catch (error) {
		console.error(`Failed to pull ${repoPath}:`, error);
		return false;
	}
}

/**
 * Checks if a directory is a valid git repository
 * @param repoPath Path to check
 * @returns true if it's a git repository, false otherwise
 */
export async function isGitRepo(repoPath: string): Promise<boolean> {
	try {
		await execAsync(`git -C "${repoPath}" rev-parse --git-dir`);
		return true;
	} catch {
		return false;
	}
}

/**
 * Normalize GitHub path for giget
 * Removes /tree/<branch>/ segment from GitHub URLs
 * Handles root-level skills by stripping trailing SKILL.md
 */
export function normalizeGithubPath(inputUrl: string): string {
  // Example inputs:
  // https://github.com/anthropics/claude-cookbooks/tree/main/skills/custom_skills/analyzing-financial-statements
  // https://github.com/anthropics/claude-cookbooks/skills/custom_skills/analyzing-financial-statements
  // github.com/anthropics/claude-cookbooks/tree/main/skills/custom_skills/analyzing-financial-statements
  // https://github.com/owner/repo/tree/main (root-level skill)
  // https://github.com/owner/repo/tree/main/SKILL.md (root-level skill pointing to file)

  const withoutProtocol = inputUrl.replace(/^https?:\/\//i, '');
  const afterHost = withoutProtocol.replace(/^github\.com\/?/i, '');

  // Remove /tree/<branch>/ segment (with optional trailing path for root-level skills)
  // This regex finds "owner/repo/tree/<branch>/" or "owner/repo/tree/<branch>" and removes it
  const cleaned = afterHost.replace(
    /^([^/]+)\/([^/]+)\/tree\/[^/]+(?:\/(.*))?$/i,
    (_m, owner: string, repo: string, rest?: string) => rest ? `${owner}/${repo}/${rest}` : `${owner}/${repo}`
  );

  // Strip trailing SKILL.md - it's a file, not a directory
  // giget expects directory paths, not file paths
  const withoutSkillMd = cleaned.replace(/\/SKILL\.md$/i, '');

  return withoutSkillMd.replace(/\/+$/,'');
}
