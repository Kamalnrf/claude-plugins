import { multiselect, select, isCancel, note } from "@clack/prompts";
import pc from "picocolors";
import type { ClientConfig } from "../types.js";
import { getClientConfig, getAvailableClients, CLIENT_CONFIGS } from "./client-config.js";

export type Scope = "local" | "global";

export interface ScopeAndClientsResult {
	scope: Scope;
	clientIds: string[];
}

const GO_BACK_VALUE = "__GO_BACK__";

/**
 * Prompt user to select scope (local/global)
 * @param options.allowGoBack - If true, adds a "go back" option that returns "back"
 */
export async function selectScope(options?: { allowGoBack?: boolean }): Promise<Scope | "back" | null> {
	const scopeOptions: Array<{ value: string; label: string; hint?: string }> = [
		{ value: "global", label: "Global", hint: "Available for all projects" },
		{ value: "local", label: "Project", hint: "Available for this project only" },
	];

	if (options?.allowGoBack) {
		scopeOptions.push({ value: GO_BACK_VALUE, label: pc.dim("← Go back") });
	}

	const selected = await select({
		message: "Select installation scope:",
		options: scopeOptions,
	});

	if (isCancel(selected)) {
		return null;
	}

	if (selected === GO_BACK_VALUE) {
		return "back";
	}

	return selected as Scope;
}

/**
 * Get clients that support the given scope
 */
export function getClientsForScope(scope: Scope): string[] {
	return getAvailableClients().filter((clientId) => {
		const config = CLIENT_CONFIGS[clientId]!;
		if (scope === "global") {
			return !!config.globalDir;
		}
		return true; // All clients support local
	});
}

/**
 * Prompt user to select clients filtered by scope (multi-select with go back option)
 * @param options.allowGoBack - If true, adds a "go back" option that returns "back"
 */
export async function selectClients(
	scope: Scope,
	options?: { allowGoBack?: boolean },
): Promise<string[] | "back" | null> {
	const clients = getClientsForScope(scope);

	const clientOptions: Array<{ value: string; label: string }> = clients.map((clientId) => {
		const config = CLIENT_CONFIGS[clientId]!;
		return {
			value: clientId,
			label: config.name,
		};
	});

	if (options?.allowGoBack) {
		clientOptions.push({ value: GO_BACK_VALUE, label: pc.dim("← Go back") });
	}

	const selected = await multiselect({
		message: "Select client(s) to install for:",
		options: clientOptions,
		required: true,
	});

	if (isCancel(selected)) {
		return null;
	}

	const selectedArray = selected as string[];

	if (selectedArray.includes(GO_BACK_VALUE)) {
		return "back";
	}

	return selectedArray;
}

/**
 * Validate client config and show scope warnings
 * Returns validated config and scope
 */
export function validateClientAndScope(
	clientId: string,
	local: boolean,
): { config: ClientConfig; scope: Scope } {
	const config = getClientConfig(clientId);
	if (!config) {
		const available = getAvailableClients().join(", ");
		throw new Error(`Unknown client: ${clientId}\nAvailable: ${available}`);
	}

	const scope: Scope = local ? "local" : "global";

	if (scope === "global" && !config.globalDir) {
		note(
			`Client "${config.name}" does not support global installation.\nInstalling to project directory instead.`,
		);
	}

	return { config, scope };
}

/**
 * Interactive prompt to select scope and clients together
 * Filters clients based on selected scope (global-only clients filtered out for global scope)
 * 
 * @param options.client - Pre-selected client (skips client prompt)
 * @param options.local - Pre-selected scope (true = local, undefined = prompt)
 * @param options.allowGoBack - If true, user can go back at each step (returns "back")
 * @returns Selected scope and client IDs, "back" if user chose to go back, or null if cancelled
 */
export async function selectScopeAndClients(options: {
	client?: string;
	local?: boolean;
	allowGoBack?: boolean;
}): Promise<ScopeAndClientsResult | "back" | null> {
	// 1. Determine scope (from flag or prompt)
	let scope: Scope;
	if (options.local !== undefined && options.local) {
		scope = "local";
	} else if (options.client) {
		// If client was specified via flag, default to global
		scope = "global";
	} else {
		const selectedScope = await selectScope({ allowGoBack: options.allowGoBack });
		if (!selectedScope) {
			return null;
		}
		if (selectedScope === "back") {
			return "back";
		}
		scope = selectedScope;
	}

	// 2. Determine which clients to install for
	let clientIds: string[];
	if (options.client) {
		validateClientAndScope(options.client, scope === "local");
		clientIds = [options.client];
	} else {
		const selectedClients = await selectClients(scope, { allowGoBack: options.allowGoBack });
		if (!selectedClients) {
			return null;
		}
		if (selectedClients === "back") {
			return "back";
		}
		clientIds = selectedClients;
	}

	return { scope, clientIds };
}
