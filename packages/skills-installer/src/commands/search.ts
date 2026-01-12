import { text, select, spinner, note, isCancel, outro } from "@clack/prompts";
import pc from "picocolors";
import type { SearchOptions, SearchResultSkill, SortField } from "../types.js";
import { searchSkills } from "../lib/api.js";
import { getClientConfig, getAvailableClients, CLIENT_CONFIGS } from "../lib/client-config.js";
import { install } from "./install.js";
import { formatNumber } from "../util.js";

const LOAD_MORE_VALUE = "__LOAD_MORE__";
const SORT_VALUE = "__SORT__";
const EXIT_VALUE = "__EXIT__";
const DEFAULT_LIMIT = 5;

// Sort options available to users
const SORT_OPTIONS: Array<{ value: SortField; label: string; hint: string }> = [
	{ value: "relevance", label: "Relevance", hint: "best match for your search" },
	{ value: "downloads", label: "Most Installs", hint: "popular with the community" },
	{ value: "stars", label: "Most Stars", hint: "loved on GitHub" },
];

// Get display label for current sort
const getSortLabel = (field: SortField): string => {
	const option = SORT_OPTIONS.find((o) => o.value === field);
	return option?.label ?? "Relevance";
};

/**
 * Show a friendly exit message with ASCII art
 */
const showExitMessage = (): void => {
	const moonArt = pc.yellow(
		`    *  .  *
       .    *    .
   *   .        .       *
     .    *  .     . *
   .  *        *  .    .`,
	);

	const message =
		`${moonArt}\n\n` +
		`${pc.bold("Happy coding!")} ${pc.cyan("◝(ᵔᵕᵔ)◜")}\n\n` +
		`To find plugins and browse skills on the web, see:\n` +
		`${pc.blue(pc.underline("https://claude-plugins.dev"))}\n\n` +
		`To share ideas and issues, come visit us on the Moon:\n` +
		`${pc.magenta(pc.underline("https://discord.gg/Pt9uN4FXR4"))}\n\n` +
		`${pc.dim("This project is open-source and we'd love to hear from you!")}`;

	outro(message);
};

/**
 * Convert sort field to API params
 */
const getSortParams = (field: SortField) => {
	if (field === "relevance") return {};
	if (field === "downloads") return { orderBy: "downloads" as const, order: "desc" as const };
	return { orderBy: "stars" as const, order: "desc" as const };
};

/**
 * Clear terminal lines to reset display before re-rendering select prompt
 * This prevents visual artifacts when paginating results
 */
const clearPreviousSelect = (lineCount: number): void => {
	// Move cursor up and clear each line
	for (let i = 0; i < lineCount; i++) {
		process.stdout.write("\x1B[1A"); // Move cursor up one line
		process.stdout.write("\x1B[2K"); // Clear the entire line
	}
};

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
	currentSort: SortField,
): Array<{ value: string; label: string; hint?: string }> => {
	const options: Array<{ value: string; label: string; hint?: string }> = skills.map((skill) => ({
		value: skill.namespace,
		label: formatSkillOption(skill),
	}));

	// Sort option - always available
	options.push({
		value: SORT_VALUE,
		label: pc.cyan(`↕ Sort results by...`),
		hint: `currently: ${getSortLabel(currentSort)}`,
	});

	if (hasMore) {
		options.push({
			value: LOAD_MORE_VALUE,
			label: pc.cyan("→ Load more results..."),
		});
	}

	options.push({
		value: EXIT_VALUE,
		label: pc.dim("Exit"),
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
	let initialSelectionIndex = 0; // Track where to position cursor after loading more

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
			showExitMessage();
			return;
		}

		query = queryInput as string;
	}

	// Track current sort (can be changed via in-list option)
	let currentSort: SortField = "relevance";

	// 2. Search loop (supports pagination and re-sorting)
	while (true) {
		// Fetch results
		s.start(offset === 0 ? "Searching..." : "Loading more results...");

		try {
			const response = await searchSkills({
				query,
				limit,
				offset,
				...getSortParams(currentSort),
			});
			total = response.total;

			if (offset === 0) {
				allSkills = response.skills;
			} else {
				allSkills = [...allSkills, ...response.skills];
			}

			// Only show "Found X skills" message on initial search
			if (offset === 0) {
				s.stop(`Found ${total} skill${total !== 1 ? "s" : ""} for "${query}"`);
			} else {
				s.stop(`Loaded ${allSkills.length} of ${total} skills`);
			}
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
		const selectOptions = buildSelectOptions(allSkills, hasMore, currentSort);

		// Set initial selection to the first newly loaded skill (or first skill on initial load)
		const initialValue = allSkills[initialSelectionIndex]?.namespace;

		const selection = await select({
			message: `Select a skill to install (${allSkills.length} of ${total}):`,
			options: selectOptions,
			maxItems: 12,
			initialValue,
		});

		if (isCancel(selection)) {
			showExitMessage();
			return;
		}

		// Handle sort change
		if (selection === SORT_VALUE) {
			// Clear previous select output
			const visibleItems = Math.min(12, selectOptions.length);
			const linesToClear = visibleItems + 3;
			clearPreviousSelect(linesToClear);

			const sortSelection = await select({
				message: "Sort results by:",
				options: SORT_OPTIONS,
				initialValue: currentSort,
			});

			if (isCancel(sortSelection)) {
				showExitMessage();
				return;
			}

			const newSort = sortSelection as SortField;
			if (newSort !== currentSort) {
				currentSort = newSort;
				// Reset pagination and results when sort changes
				offset = 0;
				allSkills = [];
				initialSelectionIndex = 0;
			}
			continue;
		}

		// Handle pagination
		if (selection === LOAD_MORE_VALUE) {
			// Clear previous select output to prevent visual artifacts
			// Estimate lines: 1 for message + min(maxItems, options.length) visible items + some buffer
			const visibleItems = Math.min(12, selectOptions.length);
			const linesToClear = visibleItems + 3; // +3 for message, status line, and buffer
			clearPreviousSelect(linesToClear);

			// Set cursor position to first newly loaded skill on next render
			initialSelectionIndex = allSkills.length;

			offset += limit;
			continue;
		}

		// Handle exit
		if (selection === EXIT_VALUE) {
			showExitMessage();
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
				showExitMessage();
				return;
			}

			clientKey = clientSelection as string;
		}

		const clientConfig = getClientConfig(clientKey)!;

		// 6. Determine scope (from flag, client capability, or prompt)
		let isLocal = options.local === true;

		if (!isLocal && !clientConfig.globalDir) {
			// Client doesn't support global
			note(`${clientConfig.name} only supports local installation.`, "Note");
			isLocal = true;
		} else if (!isLocal) {
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
				showExitMessage();
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
