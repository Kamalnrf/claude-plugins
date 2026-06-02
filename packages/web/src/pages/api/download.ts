import type { APIRoute } from "astro";
import { REGISTRY_BASE } from "../../lib/api";

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const namespace = url.searchParams.get("namespace");

	// 1. Validate namespace
	if (!namespace) {
		return new Response(
			JSON.stringify({ error: "Missing namespace parameter" }),
			{ status: 400, headers: { "Content-Type": "application/json" } },
		);
	}

	// 2. Parse and validate namespace (owner/marketplace/skillName)
	const parts = namespace.split("/");
	if (parts.length !== 3) {
		return new Response(
			JSON.stringify({ error: "Invalid namespace format" }),
			{ status: 400, headers: { "Content-Type": "application/json" } },
		);
	}
	const [owner, marketplace, skillName] = parts;

	// Reject namespace parts containing control characters or path traversal
	const safePattern = /^[a-zA-Z0-9_.\-]+$/;
	if (!safePattern.test(owner) || !safePattern.test(marketplace) || !safePattern.test(skillName)) {
		return new Response(
			JSON.stringify({ error: "Invalid characters in namespace" }),
			{ status: 400, headers: { "Content-Type": "application/json" } },
		);
	}

	// 3. Fetch skill to get sourceUrl
	try {
		const skillResponse = await fetch(
			`${REGISTRY_BASE}/api/skills/${owner}/${marketplace}/${skillName}`,
		);

		if (!skillResponse.ok) {
			return new Response(
				JSON.stringify({ error: "Skill not found" }),
				{ status: 404, headers: { "Content-Type": "application/json" } },
			);
		}

		const skill = await skillResponse.json();

		// 4. Proxy to github-zip-api
		const zipUrl = `https://github-zip-api.val.run/zip?source=${encodeURIComponent(skill.sourceUrl)}`;
		const zipResponse = await fetch(zipUrl);

		if (!zipResponse.ok) {
			return new Response(
				JSON.stringify({ error: "Failed to fetch zip file" }),
				{ status: 502, headers: { "Content-Type": "application/json" } },
			);
		}

		// 5. Track install ONLY after successful zip fetch (fire-and-forget)
		fetch(
			`${REGISTRY_BASE}/api/skills/${owner}/${marketplace}/${skillName}/install`,
			{ method: "POST" },
		).catch((err) => console.error("Tracking failed:", err));

		// 6. Stream response
		return new Response(zipResponse.body, {
			status: 200,
			headers: {
				"Content-Type": "application/zip",
				"Content-Disposition": `attachment; filename="${skillName}.zip"`,
				"Cache-Control": "no-cache",
			},
		});
	} catch (error) {
		console.error("Download proxy error:", error);
		return new Response(
			JSON.stringify({ error: "Internal server error" }),
			{ status: 500, headers: { "Content-Type": "application/json" } },
		);
	}
};
