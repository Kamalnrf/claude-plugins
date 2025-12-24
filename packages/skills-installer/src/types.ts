export interface SkillIdentifier {
	owner: string;
	repo: string;
	skillName: string;
}

export interface SkillMetadata {
	id: string;
	name: string;
	sourceUrl: string;
	description: string;
	author: string;
	namespace: string;
}

export interface ClientConfig {
	name: string;
	globalDir: string;
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
