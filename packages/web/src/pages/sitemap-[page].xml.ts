import type { APIRoute } from "astro";
import { registryAPI } from "../lib/api";
import {
	SITEMAP_CONFIG,
	skillToUrl,
	type SitemapUrl,
} from "../lib/sitemap-config";

const { siteUrl, pageSize: PAGE_SIZE, staticUrlsCount: STATIC_URLS_COUNT } =
	SITEMAP_CONFIG;

export const GET: APIRoute = async ({ params }) => {
	const page = parseInt(params.page || "0", 10);

	// Validate page parameter
	if (isNaN(page) || page < 0) {
		return new Response("Not found", { status: 404 });
	}

	try {
		// First, get total count to validate page number
		const { total } = await registryAPI.searchSkills({ limit: 1, offset: 0 });

		// Validate total to prevent NaN from malformed API responses
		const safeTotal = Number.isFinite(total) ? total : 0;
		const totalUrls = safeTotal + STATIC_URLS_COUNT;
		const pageCount = Math.max(1, Math.ceil(totalUrls / PAGE_SIZE));

		// Return 404 if page is out of bounds
		if (page >= pageCount) {
			return new Response("Not found", { status: 404 });
		}

		let urls: SitemapUrl[] = [];

		const now = new Date().toISOString();

		if (page === 0) {
			// First page includes static URLs + skills
			const staticUrls: SitemapUrl[] = [
				{
					loc: siteUrl,
					lastmod: now,
					changefreq: "daily",
					priority: 1.0,
				},
				{
					loc: `${siteUrl}/skills`,
					lastmod: now,
					changefreq: "daily",
					priority: 0.9,
				},
			];

			// Fetch skills for the first page (PAGE_SIZE - STATIC_URLS_COUNT)
			const skillsLimit = PAGE_SIZE - STATIC_URLS_COUNT;
			const skillsResponse = await registryAPI.searchSkills({
				limit: skillsLimit,
				offset: 0,
			});

			const skillUrls = skillsResponse.skills.map(skillToUrl);

			urls = [...staticUrls, ...skillUrls];

			console.log(
				`Sitemap page ${page}: ${staticUrls.length} static + ${skillUrls.length} skills = ${urls.length} URLs`,
			);
		} else {
			// Subsequent pages: only skills
			// Calculate offset: account for static URLs in first page
			const offset = page * PAGE_SIZE - STATIC_URLS_COUNT;

			const skillsResponse = await registryAPI.searchSkills({
				limit: PAGE_SIZE,
				offset,
			});

			urls = skillsResponse.skills.map(skillToUrl);

			console.log(`Sitemap page ${page}: ${urls.length} skill URLs`);
		}

		const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
	)
	.join("\n")}
</urlset>`;

		return new Response(sitemap, {
			status: 200,
			headers: {
				"Content-Type": "application/xml; charset=utf-8",
				"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
			},
		});
	} catch (error) {
		console.error(`Sitemap page ${page} generation error:`, error);

		// Fallback for page 0: return minimal sitemap with homepage
		if (page === 0) {
			return new Response(
				`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
</urlset>`,
				{
					status: 200,
					headers: {
						"Content-Type": "application/xml; charset=utf-8",
						"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
					},
				},
			);
		}

		// For other pages, return 500 error
		return new Response("Internal server error", { status: 500 });
	}
};
