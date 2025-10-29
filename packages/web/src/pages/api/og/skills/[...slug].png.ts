import type { APIRoute } from "astro";
import { ImageResponse } from "@vercel/og";
import { registryAPI } from "../../../../lib/api";

export const GET: APIRoute = async ({ params }) => {
	const { slug } = params;
	const parts = slug?.split("/") || [];

	if (parts.length !== 3) {
		return new Response("Invalid slug", { status: 400 });
	}

	const [owner, marketplace, skillName] = parts;

	try {
		const skill = await registryAPI.getSkill(owner, marketplace, skillName);

		if (!skill) {
			return new Response("Skill not found", { status: 404 });
		}

		const html = {
			type: "div",
			props: {
				style: {
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "flex-start",
					justifyContent: "space-between",
					backgroundColor: "#252321",
					padding: "80px",
					fontFamily: "system-ui, sans-serif",
				},
				children: [
					{
						type: "div",
						props: {
							style: {
								display: "flex",
								flexDirection: "column",
							},
							children: [
								{
									type: "div",
									props: {
										style: {
											fontSize: "32px",
											color: "#a8b3c7",
											marginBottom: "20px",
										},
										children: "Claude Skills",
									},
								},
								{
									type: "h1",
									props: {
										style: {
											fontSize: "80px",
											fontWeight: "bold",
											color: "#fb923c",
											margin: 0,
											lineHeight: 1.1,
											maxWidth: "1000px",
										},
										children: skill.name,
									},
								},
							],
						},
					},
					{
						type: "div",
						props: {
							style: {
								display: "flex",
								flexDirection: "column",
								gap: "30px",
							},
							children: [
								{
									type: "p",
									props: {
										style: {
											fontSize: "36px",
											color: "#a8b3c7",
											margin: 0,
											lineHeight: 1.4,
											maxWidth: "1000px",
										},
										children:
											skill.description.substring(0, 120) +
											(skill.description.length > 120 ? "..." : ""),
									},
								},
								{
									type: "div",
									props: {
										style: {
											display: "flex",
											gap: "16px",
										},
										children: [
											{
												type: "div",
												props: {
													style: {
														padding: "12px 24px",
														backgroundColor: "#2d2b28",
														borderRadius: "8px",
														fontSize: "28px",
														color: "#fbbf24",
														display: "flex",
														alignItems: "center",
														gap: "12px",
													},
													children: [
														{
															type: "svg",
															props: {
																width: "24",
																height: "24",
																viewBox: "0 0 24 24",
																fill: "currentColor",
																children: {
																	type: "path",
																	props: {
																		d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
																	},
																},
															},
														},
														{
															type: "span",
															props: {
																children: skill.stars.toLocaleString(),
															},
														},
													],
												},
											},
											{
												type: "div",
												props: {
													style: {
														padding: "12px 24px",
														backgroundColor: "#2d2b28",
														borderRadius: "8px",
														fontSize: "28px",
														color: "#60a5fa",
														display: "flex",
														alignItems: "center",
														gap: "12px",
													},
													children: [
														{
															type: "svg",
															props: {
																width: "24",
																height: "24",
																viewBox: "0 0 24 24",
																fill: "currentColor",
																children: {
																	type: "path",
																	props: {
																		d: "M11 5h2v7h3l-4 4-4-4h3V5m-7 9h4v2H4v-2m16 0h-4v2h4v-2m-12 4h8v2H8v-2z",
																	},
																},
															},
														},
														{
															type: "span",
															props: {
																children: skill.installs.toLocaleString(),
															},
														},
													],
												},
											},
										],
									},
								},
								{
									type: "div",
									props: {
										style: {
											fontSize: "28px",
											color: "#6B7280",
											marginTop: "20px",
										},
										children: `${owner}/${marketplace} • claude-plugins.dev`,
									},
								},
							],
						},
					},
				],
			},
		};

		return new ImageResponse(html, {
			width: 1200,
			height: 630,
		});
	} catch (error) {
		console.error("OG Image generation error:", error);
		return new Response("Failed to generate image", { status: 500 });
	}
};
