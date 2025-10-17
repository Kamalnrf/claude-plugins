import { constants } from "node:fs";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

// Path constants
export const CLAUDE_DIR = join(homedir(), ".claude");
export const PLUGINS_DIR = join(CLAUDE_DIR, "plugins");
export const CONFIG_FILE = join(PLUGINS_DIR, "config.json");
export const KNOWN_MARKETPLACES_FILE = join(
	PLUGINS_DIR,
	"known_marketplaces.json",
);
export const MARKETPLACES_DIR = join(PLUGINS_DIR, "marketplaces");
export const CACHE_DIR = join(PLUGINS_DIR, "cache");
export const SETTINGS_FILE = join(CLAUDE_DIR, "settings.json");

// In-memory file locks to prevent race conditions
const locks = new Map<string, Promise<void>>();

/**
 * Acquires a lock on a file path and executes an operation.
 * Prevents concurrent modifications to the same file.
 */
export async function withFileLock<T>(
	filePath: string,
	operation: () => Promise<T>,
): Promise<T> {
	// Wait for any existing operation on this file
	while (locks.has(filePath)) {
		await locks.get(filePath);
	}

	// Create new lock
	let releaseLock: () => void;
	const lockPromise = new Promise<void>((resolve) => {
		releaseLock = resolve;
	});
	locks.set(filePath, lockPromise);

	try {
		return await operation();
	} finally {
		locks.delete(filePath);
		releaseLock!();
	}
}

/**
 * Checks if a file or directory exists
 */
export async function exists(path: string): Promise<boolean> {
	try {
		await access(path, constants.F_OK);
		return true;
	} catch {
		return false;
	}
}

/**
 * Ensures all required directories exist
 */
export async function ensureDirectories(): Promise<void> {
	await mkdir(PLUGINS_DIR, { recursive: true });
	await mkdir(MARKETPLACES_DIR, { recursive: true });
	await mkdir(CACHE_DIR, { recursive: true });
}

/**
 * Reads and parses a JSON file with file locking
 */
export async function readJSON<T>(filePath: string): Promise<T | null> {
	return withFileLock(filePath, async () => {
		if (!(await exists(filePath))) {
			return null;
		}

		const content = await readFile(filePath, "utf-8");

		if (!content.trim()) {
			return null;
		}

		try {
			return JSON.parse(content) as T;
		} catch (error) {
			console.warn(`Failed to parse JSON from ${filePath}:`, error);
			return null;
		}
	});
}

/**
 * Writes data to a JSON file with atomic writes and file locking
 */
export async function writeJSON<T>(filePath: string, data: T): Promise<void> {
	return withFileLock(filePath, async () => {
		const content = JSON.stringify(data, null, 2);
		const tempPath = `${filePath}.tmp`;

		// Write to temp file first
		await writeFile(tempPath, content, "utf-8");

		// Atomic rename
		await writeFile(filePath, content, "utf-8");

		// Clean up temp file
		try {
			await rm(tempPath, { force: true });
		} catch {
			// Ignore cleanup errors
		}
	});
}
