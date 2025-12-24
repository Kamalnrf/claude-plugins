const REGISTRY_BASE = "https://kamalnrf--019b5039071c71f89b185d3e047dabcb.web.val.run";
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export interface SearchParams {
	q?: string; // Search query
	category?: string; // Filter by category
	limit?: number; // Default: 20, Max: 100
	offset?: number; // Pagination offset
	hasSkills?: boolean;
	orderBy?: "downloads" | "stars"; // Sort field
	order?: "asc" | "desc"; // Sort direction
}

export interface Plugin {
	id: string;
	name: string;
	namespace: string; // "owner/marketplace/plugin"
	gitUrl: string;
	description: string;
	version: string;
	author: string;
	keywords: string[];
	skills: string[];
	category: string;
	stars: number;
	verified: boolean;
	downloads: number;
	metadata: {
		homepage: string | null;
		repository: string;
		license: string;
		commands: string[];
		agents: string[];
		mcpServers: string[];
	};
	createdAt: string;
	updatedAt: string;
}

export interface PluginStats {
	totalDownloads: number;
	downloadsThisWeek: number;
	downloadsThisMonth: number;
	lastDownloaded: string | null;
}

export interface SearchResponse {
	plugins: Plugin[];
	total: number;
	limit: number;
	offset: number;
}

export interface Skill {
	id: string;
	name: string;
	namespace: string; // "owner/marketplace/skillName"
	sourceUrl: string;
	description: string;
	version?: string;
	dependencies?: string[];
	author: string;
	stars: number;
	installs: number;
	verified: boolean;
	metadata: Record<string, any>;
	skillMdContent?: string;
	createdAt: string;
	updatedAt: string;
}

export interface SkillSearchParams {
	q?: string;
	limit?: number;
	offset?: number;
	orderBy?: "downloads" | "stars"; // Sort field
	order?: "asc" | "desc"; // Sort direction
}

export interface SkillSearchResponse {
	skills: Skill[];
	total: number;
	limit: number;
	offset: number;
}

export class RegistryAPI {
	private cache = new Map<string, { data: unknown; timestamp: number }>();

	private async fetchWithCache<T>(
		key: string,
		fetchFn: () => Promise<T>,
	): Promise<T> {
		const cached = this.cache.get(key);

		if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
			return cached.data as T;
		}

		const data = await fetchFn();
		this.cache.set(key, { data, timestamp: Date.now() });
		return data;
	}

	async searchPlugins(params: SearchParams): Promise<SearchResponse> {
		return this.fetchWithCache(`search:${JSON.stringify(params)}`, async () => {
			const url = new URL("/api/search", REGISTRY_BASE);
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined) url.searchParams.set(key, String(value));
			});

			const response = await fetch(url, {
				headers: { Accept: "application/json" },
			});

			if (!response.ok) {
				throw new Error(`Registry API error: ${response.status}`);
			}

			return response.json();
		});
	}

	async resolvePlugin(
		owner: string,
		marketplace: string,
		plugin: string,
	): Promise<Plugin> {
		return this.fetchWithCache(
			`resolve:${owner}/${marketplace}/${plugin}`,
			async () => {
				const url = `${REGISTRY_BASE}/api/resolve/${owner}/${marketplace}/${plugin}`;
				const response = await fetch(url, {
					headers: { Accept: "application/json" },
				});

				if (!response.ok) {
					throw new Error(`Plugin not found: ${response.status}`);
				}

				return response.json();
			},
		);
	}

	async getPluginStats(
		owner: string,
		marketplace: string,
		plugin: string,
	): Promise<PluginStats> {
		return this.fetchWithCache(
			`stats:${owner}/${marketplace}/${plugin}`,
			async () => {
				const url = `${REGISTRY_BASE}/api/plugins/${owner}/${marketplace}/${plugin}/stats`;
				const response = await fetch(url, {
					headers: { Accept: "application/json" },
				});

				if (!response.ok) {
					throw new Error(`Stats not found: ${response.status}`);
				}

				return response.json();
			},
		);
	}

	async getPluginReadme(gitUrl: string): Promise<string> {
		// Extract owner/repo from gitUrl
		const match = gitUrl.match(/github\.com\/([^/]+\/[^/]+)/);
		if (!match) throw new Error("Invalid GitHub URL");

		const [owner, repo] = match[1].replace(".git", "").split("/");
		const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;

		const response = await fetch(readmeUrl);
		if (!response.ok) {
			// Fallback to master branch
			const fallbackUrl = readmeUrl.replace("/main/", "/master/");
			const fallback = await fetch(fallbackUrl);
			if (!fallback.ok) throw new Error("README not found");
			return fallback.text();
		}

		return response.text();
	}

	// Parse namespace from "owner/marketplace/plugin" format
	parseNamespace(namespace: string): {
		owner: string;
		marketplace: string;
		plugin: string;
	} {
		const parts = namespace.split("/");
		if (parts.length !== 3) {
			throw new Error(`Invalid namespace format: ${namespace}`);
		}
		return {
			owner: parts[0],
			marketplace: parts[1],
			plugin: parts[2],
		};
	}

	async searchSkills(params: SearchParams): Promise<SkillSearchResponse> {
		return this.fetchWithCache(
			`skills:search:${JSON.stringify(params)}`,
			async () => {
				const url = new URL("/api/skills/search", REGISTRY_BASE);
				Object.entries(params).forEach(([key, value]) => {
					if (value !== undefined) url.searchParams.set(key, String(value));
				});

				const response = await fetch(url, {
					headers: { Accept: "application/json" },
				});

				if (!response.ok) {
					throw new Error(`Skills API error: ${response.status}`);
				}

				return response.json();
			},
		);
	}

	async getSkill(
		owner: string,
		marketplace: string,
		skillName: string,
	): Promise<Skill> {
		return this.fetchWithCache(
			`skill:${owner}/${marketplace}/${skillName}`,
			async () => {
				const url = `${REGISTRY_BASE}/api/skills/${owner}/${marketplace}/${skillName}`;
				const response = await fetch(url, {
					headers: { Accept: "application/json" },
				});

				if (!response.ok) {
					throw new Error(`Skill not found: ${response.status}`);
				}

				return response.json();
			},
		);
	}
}

export const registryAPI = new RegistryAPI();
