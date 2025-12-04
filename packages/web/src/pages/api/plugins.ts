import type { APIRoute } from "astro";
import { registryAPI } from "../../lib/api";

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const q = url.searchParams.get("q") || "";
	const hasSkills = url.searchParams.get("hasSkills") === "true";
	const limit = parseInt(url.searchParams.get("limit") || "20", 10);
	const offset = parseInt(url.searchParams.get("offset") || "0", 10);
	const orderBy = url.searchParams.get("orderBy") as "downloads" | "stars" | null;
	const order = url.searchParams.get("order") as "asc" | "desc" | null;

	try {
		const result = await registryAPI.searchPlugins({
			q,
			limit,
			offset,
			hasSkills,
			...(orderBy && { orderBy }),
			...(order && { order }),
		});

		return new Response(JSON.stringify(result), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		});
	} catch (error) {
		console.error("API error:", error);
		return new Response(JSON.stringify({ error: "Failed to fetch plugins" }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}
};
