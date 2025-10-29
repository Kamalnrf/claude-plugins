import type { APIRoute } from "astro";
import { registryAPI } from "../../lib/api";

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const q = url.searchParams.get("q") || "";
	const limit = parseInt(url.searchParams.get("limit") || "20", 10);
	const offset = parseInt(url.searchParams.get("offset") || "0", 10);

	try {
		const result = await registryAPI.searchSkills({ q, limit, offset });

		return new Response(JSON.stringify(result), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
			},
		});
	} catch (error) {
		console.error("Skills API error:", error);
		return new Response(
			JSON.stringify({
				error: "Failed to fetch skills",
				message: error instanceof Error ? error.message : "Unknown error",
			}),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	}
};
