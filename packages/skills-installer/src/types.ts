export interface ClientConfig {
	name: string;
	globalDir?: string;
	localDir: string;
}

export type InstallScope = "global" | "local";

export interface InstallOptions {
	client: string;
	local: boolean;
}

export interface ListOptions {
	client?: string;
}

export interface UninstallOptions {
	client: string;
	local: boolean;
}

// Search API types
export interface SearchResultSkill {
	id: string;
	name: string;
	namespace: string;
	sourceUrl: string;
	description: string | null;
	author: string;
	stars: number;
	installs: number;
	verified: boolean;
	metadata: {
		repoOwner: string;
		repoName: string;
		directoryPath: string;
		rawFileUrl: string;
	};
	createdAt: string;
	updatedAt: string;
}

export interface SearchResponse {
	skills: SearchResultSkill[];
	total: number;
	limit: number;
	offset: number;
}

// Sort options for search
export type SortField = "relevance" | "downloads" | "stars";

export interface SearchOptions {
	query?: string;
	client?: string;
	local?: boolean;
}
