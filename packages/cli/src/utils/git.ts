import { $ } from "bun";
import { exists } from "./fs";

/**
 * Clones a git repository to the specified destination
 * @param url Git repository URL
 * @param destination Local path to clone into
 * @returns true if successful, false otherwise
 */
export async function cloneRepo(url: string, destination: string): Promise<boolean> {
  try {
    // Check if destination already exists
    if (await exists(destination)) {
      console.warn(`Destination ${destination} already exists, skipping clone`);
      return true;
    }

    // Clone with depth=1 for faster cloning (shallow clone)
    await $`git clone --depth 1 ${url} ${destination}`.quiet();
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

    await $`git -C ${repoPath} pull`.quiet();
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
    await $`git -C ${repoPath} rev-parse --git-dir`.quiet();
    return true;
  } catch {
    return false;
  }
}
