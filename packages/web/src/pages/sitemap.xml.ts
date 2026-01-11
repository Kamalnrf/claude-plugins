import type { APIRoute } from "astro";
import { registryAPI } from "../lib/api";
import { SITEMAP_CONFIG, escapeXml } from "../lib/sitemap-config";

const { siteUrl, pageSize: PAGE_SIZE, staticUrlsCount: STATIC_URLS_COUNT } =
	SITEMAP_CONFIG;

export const GET: APIRoute = async () => {
	try {
		// Fetch just the total count (minimal request)
		const { total } = await registryAPI.searchSkills({ limit: 1, offset: 0 });

		// Validate total to prevent NaN/empty sitemaps from malformed API responses
		const safeTotal = Number.isFinite(total) ? total : 0;
		const totalUrls = safeTotal + STATIC_URLS_COUNT;
		const pageCount = Math.max(1, Math.ceil(totalUrls / PAGE_SIZE));

		console.log(
			`Sitemap index: ${safeTotal} skills, ${totalUrls} total URLs, ${pageCount} pages`,
		);

		const sitemaps = Array.from({ length: pageCount }, (_, i) => ({
			loc: `${siteUrl}/sitemap-${i}.xml`,
		}));

		const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
	.map(
		(sitemap) => `  <sitemap>
    <loc>${escapeXml(sitemap.loc)}</loc>
  </sitemap>`,
	)
	.join("\n")}
</sitemapindex>`;

		return new Response(sitemapIndex, {
			status: 200,
			headers: {
				"Content-Type": "application/xml; charset=utf-8",
				"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
			},
		});
	} catch (error) {
		console.error("Sitemap index generation error:", error);
		// Fallback: return a minimal sitemap index with just one sitemap
		return new Response(
			`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${escapeXml(`${siteUrl}/sitemap-0.xml`)}</loc>
  </sitemap>
</sitemapindex>`,
			{
				status: 200,
				headers: {
					"Content-Type": "application/xml; charset=utf-8",
					"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
				},
			},
		);
	}
};
