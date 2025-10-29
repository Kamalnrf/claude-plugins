import type { APIRoute } from "astro";
import { registryAPI } from "../lib/api";

const siteUrl = "https://claude-plugins.dev";

export const GET: APIRoute = async () => {
	try {
		const skillsResponse = await registryAPI.searchSkills({
			limit: 10000,
		});
		const skills = skillsResponse.skills || [];

		const urls = [
			{
				loc: siteUrl,
				lastmod: new Date().toISOString(),
				changefreq: "daily",
				priority: 1.0,
			},
			{
				loc: `${siteUrl}/skills`,
				lastmod: new Date().toISOString(),
				changefreq: "daily",
				priority: 0.9,
			},
			...skills.map((skill) => {
				const updatedDate = new Date(skill.updatedAt);
				const daysSinceUpdate =
					(Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24);

				return {
					loc: `${siteUrl}/skills/${skill.namespace}`,
					lastmod: skill.updatedAt,
					changefreq: daysSinceUpdate < 7 ? "daily" : "weekly",
					priority: 0.8,
				};
			}),
		];

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
				"Cache-Control": "public, max-age=3600",
			},
		});
	} catch (error) {
		console.error("Sitemap generation error:", error);
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
				},
			},
		);
	}
};
