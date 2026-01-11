export const SITEMAP_CONFIG = {
	siteUrl: "https://claude-plugins.dev",
	pageSize: 50000,
	staticUrlsCount: 2, // Homepage and /skills
} as const;

/** Escape special XML characters to prevent malformed XML */
export function escapeXml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

/** URL type for sitemap entries */
export interface SitemapUrl {
	loc: string;
	lastmod?: string;
	changefreq?: string;
	priority: number;
}

/** Skill type for mapping (minimal interface for sitemap generation) */
export interface SkillForSitemap {
	namespace: string;
	updatedAt: string;
}

/**
 * Convert a skill to a sitemap URL entry.
 * Validates updatedAt date and URL-encodes the namespace before XML escaping.
 */
export function skillToUrl(skill: SkillForSitemap): SitemapUrl {
	const updatedDate = new Date(skill.updatedAt);
	const isValidDate = !isNaN(updatedDate.getTime());

	const daysSinceUpdate = isValidDate
		? (Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24)
		: Infinity; // Treat invalid dates as very old

	return {
		loc: escapeXml(`${SITEMAP_CONFIG.siteUrl}/skills/${encodeURIComponent(skill.namespace)}`),
		...(isValidDate ? { lastmod: updatedDate.toISOString().split('T')[0], changefreq: daysSinceUpdate < 7 ? "daily" : "weekly", } : {}),
		priority: 0.8,
	};
}
