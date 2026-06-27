import { describe, expect, test } from "bun:test";
import { formatNumber } from "./util";

describe("formatNumber", () => {
	test("returns plain number for values below 1000", () => {
		expect(formatNumber(0)).toBe("0");
		expect(formatNumber(1)).toBe("1");
		expect(formatNumber(999)).toBe("999");
	});

	test("formats thousands with k suffix", () => {
		expect(formatNumber(1000)).toBe("1k");
		expect(formatNumber(1500)).toBe("1.5k");
		expect(formatNumber(10000)).toBe("10k");
		expect(formatNumber(999999)).toBe("1000k");
	});

	test("strips trailing .0 for even thousands", () => {
		expect(formatNumber(2000)).toBe("2k");
		expect(formatNumber(50000)).toBe("50k");
	});

	test("formats millions with M suffix", () => {
		expect(formatNumber(1000000)).toBe("1M");
		expect(formatNumber(1500000)).toBe("1.5M");
		expect(formatNumber(10000000)).toBe("10M");
	});

	test("strips trailing .0 for even millions", () => {
		expect(formatNumber(2000000)).toBe("2M");
	});

	test("handles edge values around boundaries", () => {
		expect(formatNumber(999)).toBe("999");
		expect(formatNumber(1000)).toBe("1k");
		expect(formatNumber(999999)).toBe("1000k");
		expect(formatNumber(1000000)).toBe("1M");
	});
});
