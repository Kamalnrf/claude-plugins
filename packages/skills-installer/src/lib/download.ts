import { downloadTemplate } from "giget";

/**
 * Normalize GitHub path for giget
 * Removes /tree/<branch>/ segment from GitHub URLs
 * Handles root-level skills by stripping trailing SKILL.md
 * Returns both the normalized path and the branch (if present)
 */
export const normalizeGithubPath = (inputUrl: string): { path: string; branch?: string } => {
	const withoutProtocol = inputUrl.replace(/^https?:\/\//i, "");
	const afterHost = withoutProtocol.replace(/^github\.com\/?/i, "");

	// Extract branch if present in /tree/<branch>/ segment
	const branchMatch = afterHost.match(/^([^/]+)\/([^/]+)\/tree\/([^/]+)(?:\/(.*))?$/i);
	const branch = branchMatch?.[3];

	// Remove /tree/<branch>/ segment (with optional trailing path for root-level skills)
	const cleaned = afterHost.replace(
		/^([^/]+)\/([^/]+)\/tree\/[^/]+(?:\/(.*))?$/i,
		(_m, owner: string, repo: string, rest?: string) =>
			rest ? `${owner}/${repo}/${rest}` : `${owner}/${repo}`,
	);

	// Strip trailing SKILL.md - it's a file, not a directory
	// giget expects directory paths, not file paths
	const withoutSkillMd = cleaned.replace(/\/SKILL\.md$/i, "");

	const path = withoutSkillMd.replace(/\/+$/, "");

	return { path, branch };
};

/**
 * Wait for specified milliseconds
 */
const wait = (ms: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 */
const exponentialBackoff = (attempt: number): number =>
	Math.pow(2, attempt - 1) * 1000;

/**
 * Download skill from GitHub with retry logic
 */
export const downloadSkill = async (
	sourceUrl: string,
	targetPath: string,
	retries = 3,
): Promise<void> => {
	const { path, branch } = normalizeGithubPath(sourceUrl);
	let lastError: Error | undefined;

	// Construct template with branch if master
	// This is done as there is an issue with the downloadTemplate function when default branch is master (more context: https://github.com/Kamalnrf/claude-plugins/issues/29)
	const template = branch && branch === "master"
		? `gh:${path}#${branch}`
		: `gh:${path}`;

	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			await downloadTemplate(template, {
				dir: targetPath,
				force: true,
			});
			return; // Success!
		} catch (error) {
			lastError = error as Error;

			// Wait before retrying (except on last attempt)
			if (attempt < retries) {
				await wait(exponentialBackoff(attempt));
			}
		}
	}

	throw new Error(
		`Download failed after ${retries} attempts: ${lastError?.message}`,
	);
};
