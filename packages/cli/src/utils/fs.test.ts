import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { exists, readJSON, writeJSON, withFileLock } from "./fs";

let tempDir: string;

beforeEach(async () => {
	tempDir = await mkdtemp(join(tmpdir(), "fs-test-"));
});

afterEach(async () => {
	await rm(tempDir, { recursive: true, force: true });
});

describe("exists", () => {
	test("returns true for an existing file", async () => {
		const filePath = join(tempDir, "exists.txt");
		await writeFile(filePath, "hello");
		expect(await exists(filePath)).toBe(true);
	});

	test("returns false for a non-existent file", async () => {
		expect(await exists(join(tempDir, "nope.txt"))).toBe(false);
	});

	test("returns true for an existing directory", async () => {
		const dirPath = join(tempDir, "subdir");
		await mkdir(dirPath);
		expect(await exists(dirPath)).toBe(true);
	});
});

describe("readJSON", () => {
	test("returns parsed object from valid JSON file", async () => {
		const filePath = join(tempDir, "data.json");
		await writeFile(filePath, JSON.stringify({ key: "value" }));
		const result = await readJSON<{ key: string }>(filePath);
		expect(result).toEqual({ key: "value" });
	});

	test("returns null for non-existent file", async () => {
		const result = await readJSON(join(tempDir, "missing.json"));
		expect(result).toBeNull();
	});

	test("returns null for empty file", async () => {
		const filePath = join(tempDir, "empty.json");
		await writeFile(filePath, "   ");
		const result = await readJSON(filePath);
		expect(result).toBeNull();
	});

	test("returns null for invalid JSON content", async () => {
		const filePath = join(tempDir, "bad.json");
		await writeFile(filePath, "not-json{{{");
		const result = await readJSON(filePath);
		expect(result).toBeNull();
	});

	test("handles nested JSON objects", async () => {
		const data = { users: [{ id: 1, name: "Alice" }], count: 1 };
		const filePath = join(tempDir, "nested.json");
		await writeFile(filePath, JSON.stringify(data));
		expect(await readJSON(filePath)).toEqual(data);
	});
});

describe("writeJSON", () => {
	test("writes data as formatted JSON", async () => {
		const filePath = join(tempDir, "out.json");
		await writeJSON(filePath, { foo: "bar" });

		const content = await Bun.file(filePath).text();
		expect(JSON.parse(content)).toEqual({ foo: "bar" });
	});

	test("overwrites existing file", async () => {
		const filePath = join(tempDir, "overwrite.json");
		await writeJSON(filePath, { version: 1 });
		await writeJSON(filePath, { version: 2 });

		const result = await readJSON<{ version: number }>(filePath);
		expect(result?.version).toBe(2);
	});

	test("writes arrays", async () => {
		const filePath = join(tempDir, "arr.json");
		await writeJSON(filePath, [1, 2, 3]);
		expect(await readJSON(filePath)).toEqual([1, 2, 3]);
	});
});

describe("withFileLock", () => {
	test("executes and returns the result of the operation", async () => {
		const result = await withFileLock("/tmp/test-lock", async () => {
			return 42;
		});
		expect(result).toBe(42);
	});

	test("serializes concurrent operations on the same path", async () => {
		const order: number[] = [];
		const filePath = join(tempDir, "lock-test");

		const op1 = withFileLock(filePath, async () => {
			await new Promise((r) => setTimeout(r, 50));
			order.push(1);
		});

		const op2 = withFileLock(filePath, async () => {
			order.push(2);
		});

		await Promise.all([op1, op2]);
		expect(order).toEqual([1, 2]);
	});

	test("allows parallel operations on different paths", async () => {
		const results: string[] = [];

		const op1 = withFileLock(join(tempDir, "a"), async () => {
			await new Promise((r) => setTimeout(r, 20));
			results.push("a");
			return "a";
		});

		const op2 = withFileLock(join(tempDir, "b"), async () => {
			results.push("b");
			return "b";
		});

		await Promise.all([op1, op2]);
		expect(results).toContain("a");
		expect(results).toContain("b");
	});

	test("releases lock even if operation throws", async () => {
		const filePath = join(tempDir, "error-lock");

		try {
			await withFileLock(filePath, async () => {
				throw new Error("fail");
			});
		} catch {
			// expected
		}

		// Should be able to acquire the lock again
		const result = await withFileLock(filePath, async () => "recovered");
		expect(result).toBe("recovered");
	});
});
