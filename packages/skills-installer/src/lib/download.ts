import { downloadTemplate } from "giget";

/**
 * Normalize GitHub path for giget
 * Removes /tree/<branch>/ segment from GitHub URLs
 * Handles root-level skills by stripping trailing SKILL.md
 */
export const normalizeGithubPath = (inputUrl: string): string => {
	const withoutProtocol = inputUrl.replace(/^https?:\/\//i, "");
	const afterHost = withoutProtocol.replace(/^github\.com\/?/i, "");

	// Remove /tree/<branch>/ segment (with optional trailing path for root-level skills)
	const cleaned = afterHost.replace(
		/^([^/]+)\/([^/]+)\/tree\/[^/]+(?:\/(.*))?$/i,
		(_m, owner: string, repo: string, rest?: string) =>
			rest ? `${owner}/${repo}/${rest}` : `${owner}/${repo}`,
	);

	// Strip trailing SKILL.md - it's a file, not a directory
	// giget expects directory paths, not file paths
	const withoutSkillMd = cleaned.replace(/\/SKILL\.md$/i, "");

	return withoutSkillMd.replace(/\/+$/, "");
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
	const normalizedUrl = normalizeGithubPath(sourceUrl);
	let lastError: Error | undefined;

	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			await downloadTemplate(`gh:${normalizedUrl}`, {
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
