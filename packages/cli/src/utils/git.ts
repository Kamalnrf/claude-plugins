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
	if (await exists(destination)) {
		return true;
	}

	try {
		await execAsync(`git clone --depth 1 "${url}" "${destination}"`);
		return true;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`Failed to clone ${url}: ${message}`);
	}
}

/**
 * Pulls latest changes from a git repository
 * @param repoPath Path to the local git repository
 * @returns true if successful, false otherwise
 */
export async function pullRepo(repoPath: string): Promise<boolean> {
	if (!(await exists(repoPath))) {
		throw new Error(`Repository path does not exist: ${repoPath}`);
	}

	try {
		await execAsync(`git -C "${repoPath}" pull`);
		return true;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`Failed to pull ${repoPath}: ${message}`);
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
