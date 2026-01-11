import type { APIRoute } from "astro";
import { registryAPI } from "../lib/api";

const siteUrl = "https://claude-plugins.dev";
const PAGE_SIZE = 50000;
const STATIC_URLS_COUNT = 2; // Homepage and /skills

export const GET: APIRoute = async () => {
	try {
		// Fetch just the total count (minimal request)
		const { total } = await registryAPI.searchSkills({ limit: 1, offset: 0 });
		const totalUrls = total + STATIC_URLS_COUNT;
		const pageCount = Math.ceil(totalUrls / PAGE_SIZE);

		console.log(
			`Sitemap index: ${total} skills, ${totalUrls} total URLs, ${pageCount} pages`,
		);

		const now = new Date().toISOString();

		const sitemaps = Array.from({ length: pageCount }, (_, i) => ({
			loc: `${siteUrl}/sitemap-${i}.xml`,
			lastmod: now,
		}));

		const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
	.map(
		(sitemap) => `  <sitemap>
    <loc>${sitemap.loc}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`,
	)
	.join("\n")}
</sitemapindex>`;

		return new Response(sitemapIndex, {
			status: 200,
			headers: {
				"Content-Type": "application/xml; charset=utf-8",
				"Cache-Control": "public, max-age=3600",
			},
		});
	} catch (error) {
		console.error("Sitemap index generation error:", error);
		// Fallback: return a minimal sitemap index with just one sitemap
		return new Response(
			`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${siteUrl}/sitemap-0.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`,
			{
				status: 200,
				headers: {
					"Content-Type": "application/xml; charset=utf-8",
				},
			},
		);
	}
};
