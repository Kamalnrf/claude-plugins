import { text, select, spinner, note, cancel, isCancel } from "@clack/prompts";
import pc from "picocolors";
import type { SearchOptions, SearchResultSkill } from "../types.js";
import { searchSkills } from "../lib/api.js";
import { getClientConfig, getAvailableClients, CLIENT_CONFIGS } from "../lib/client-config.js";
import { install } from "./install.js";
import { formatNumber } from "../util.js";

const LOAD_MORE_VALUE = "__LOAD_MORE__";
const CANCEL_VALUE = "__CANCEL__";
const DEFAULT_LIMIT = 5;

/**
 * Format a skill for display in the select prompt
 */
const formatSkillOption = (skill: SearchResultSkill): string => {
	const name = pc.bold(skill.name);
	const author = pc.dim(`by ${skill.author}`);
	const stats = pc.yellow(`★ ${formatNumber(skill.stars)} Stars`) + pc.greenBright(` · ${formatNumber(skill.installs)} installs`);
	const desc = skill.description
		? `${pc.dim(skill.description.slice(0, 70))}${skill.description.length > 70 ? "..." : ""}`
		: "";
	return `${name} ${author} ${stats}
	${desc} \n`;
};

/**
 * Build select options from search results
 */
const buildSelectOptions = (
	skills: SearchResultSkill[],
	hasMore: boolean,
): Array<{ value: string; label: string; hint?: string }> => {
	const options = skills.map((skill) => ({
		value: skill.namespace,
		label: formatSkillOption(skill),
	}));

	if (hasMore) {
		options.push({
			value: LOAD_MORE_VALUE,
			label: pc.cyan("→ Load more results..."),
		});
	}

	options.push({
		value: CANCEL_VALUE,
		label: pc.dim("Cancel"),
	});

	return options;
};

/**
 * Build client select options
 */
const buildClientOptions = (): Array<{ value: string; label: string; hint?: string }> => {
	return Object.entries(CLIENT_CONFIGS).map(([key, config]) => ({
		value: key,
		label: config.name,
		hint: config.globalDir ? "supports global" : "local only",
	}));
};

/**
 * Interactive search command
 */
export async function search(options: SearchOptions = {}): Promise<void> {
	const s = spinner();
	const limit = DEFAULT_LIMIT;
	let offset = 0;
	let allSkills: SearchResultSkill[] = [];
	let total = 0;

	// 1. Get search query (from options or prompt user)
	let query = options.query;
	if (!query) {
		const queryInput = await text({
			message: "Search for skills:",
			placeholder: "e.g., frontend, python, testing...",
			validate: (value) => {
				if (!value.trim()) return "Please enter a search query";
				if (value.trim().length < 2) return "Query must be at least 2 characters";
			},
		});

		if (isCancel(queryInput)) {
			cancel("Search cancelled");
			return;
		}

		query = queryInput as string;
	}

	// 2. Search loop (supports pagination)
	while (true) {
		// Fetch results
		s.start(offset === 0 ? "Searching..." : "Loading more results...");

		try {
			const response = await searchSkills(query, limit, offset);
			total = response.total;

			if (offset === 0) {
				allSkills = response.skills;
			} else {
				allSkills = [...allSkills, ...response.skills];
			}

			s.stop(`Found ${total} skill${total !== 1 ? "s" : ""} for "${query}"`);
		} catch (error) {
			s.stop("Search failed");
			throw error;
		}

		// Handle no results
		if (allSkills.length === 0) {
			note(
				`No skills found for "${pc.cyan(query)}"\n\n` +
					`Try a different search term or browse at:\n` +
					pc.blue(pc.underline("https://claude-plugins.dev/skills")),
				"No Results",
			);
			return;
		}

		// 3. Show results in select prompt
		const hasMore = allSkills.length < total;
		const selectOptions = buildSelectOptions(allSkills, hasMore);

		const selection = await select({
			message: `Select a skill to install (${allSkills.length} of ${total}):`,
			options: selectOptions,
			maxItems: 12,
		});

		if (isCancel(selection)) {
			cancel("Search cancelled");
			return;
		}

		// Handle pagination
		if (selection === LOAD_MORE_VALUE) {
			offset += limit;
			continue;
		}

		// Handle cancel
		if (selection === CANCEL_VALUE) {
			cancel("Search cancelled");
			return;
		}

		// 4. Skill selected - get details
		const selectedNamespace = selection as string;
		const selectedSkill = allSkills.find((s) => s.namespace === selectedNamespace);

		if (!selectedSkill) {
			throw new Error("Selected skill not found");
		}

		note(
			`${pc.bold(selectedSkill.name)}\n` +
				`Author: ${selectedSkill.author}\n` +
				`Stars: ${formatNumber(selectedSkill.stars)} · Installs: ${formatNumber(selectedSkill.installs)}`,
			"Selected Skill",
		);

		// 5. Determine client (from flag or prompt)
		let clientKey = options.client;

		if (clientKey) {
			// Validate provided client
			const config = getClientConfig(clientKey);
			if (!config) {
				const available = getAvailableClients().join(", ");
				throw new Error(`Unknown client: ${clientKey}\nAvailable: ${available}`);
			}
		} else {
			// Prompt for client selection
			const clientOptions = buildClientOptions();
			const clientSelection = await select({
				message: "Select target client:",
				options: clientOptions,
				initialValue: "claude-code",
			});

			if (isCancel(clientSelection)) {
				cancel("Search cancelled");
				return;
			}

			clientKey = clientSelection as string;
		}

		const clientConfig = getClientConfig(clientKey);
		if (!clientConfig) {
			throw new Error(`Unknown client: ${clientKey}`);
		}

		// 6. Determine scope (from flag, client capability, or prompt)
		let isLocal = options.local ?? false;

		if (options.local) {
			// --local flag provided, use local
			isLocal = true;
		} else if (!clientConfig.globalDir) {
			// Client doesn't support global
			note(`${clientConfig.name} only supports local installation.`, "Note");
			isLocal = true;
		} else {
			// Prompt for scope
			const scopeSelection = await select({
				message: "Installation scope:",
				options: [
					{ value: "global", label: "Global", hint: "available for all projects" },
					{ value: "local", label: "Local", hint: "current project only" },
				],
				initialValue: "global",
			});

			if (isCancel(scopeSelection)) {
				cancel("Search cancelled");
				return;
			}

			isLocal = scopeSelection === "local";
		}

		// 7. Install the skill using existing install function
		await install(selectedNamespace, {
			client: clientKey,
			local: isLocal,
		});

		// Exit the search loop after installation
		break;
	}
}
