import { text, select, spinner, note, isCancel } from "@clack/prompts";
import pc from "picocolors";
import type { SearchOptions, SearchResultSkill, SortField } from "../types.js";
import { searchSkills, fetchMetaSkill} from "../lib/api.js";
import { installSingleSkill } from "./install.js";
import { formatNumber, showExitMessage } from "../util.js";
import { selectScopeAndClients } from "../lib/select-scope-and-clients.js";

const LOAD_MORE_VALUE = "__LOAD_MORE__";
const SORT_VALUE = "__SORT__";
const NEW_SEARCH_VALUE = "__NEW_SEARCH__";
const EXIT_VALUE = "__EXIT__";
const INSTALL_META_SKILL_VALUE = "__INSTALL_META_SKILL__";
const DEFAULT_LIMIT = 5;
const MAX_VISIBLE_ITEMS = 12;

// Sort options available to users
const SORT_OPTIONS: Array<{ value: SortField; label: string; hint: string }> = [
	{ value: "relevance", label: "Relevance", hint: "best match for your search" },
	{ value: "downloads", label: "Most Installs", hint: "popular with the community" },
	{ value: "stars", label: "Most Stars", hint: "loved on GitHub" },
];

const validateSearchQuery = (value: string): string | undefined => {
	if (!value.trim()) return "Please enter a search query";
	if (value.trim().length < 2) return "Query must be at least 2 characters";
};

// Get display label for current sort
const getSortLabel = (field: SortField): string => {
	const option = SORT_OPTIONS.find((o) => o.value === field);
	return option?.label ?? "Relevance";
};

/**
 * Convert sort field to API params
 */
const getSortParams = (field: SortField) => {
	if (field === "relevance") return {};
	if (field === "downloads") return { orderBy: "downloads" as const, order: "desc" as const };
	return { orderBy: "stars" as const, order: "desc" as const };
};

/** Clear terminal lines to prevent visual artifacts when re-rendering */
const clearLines = (count: number): void => {
	for (let i = 0; i < count; i++) {
		process.stdout.write("\x1B[1A\x1B[2K"); // Move up + clear line
	}
};

/**
 * Format a skill for display in the select prompt
 */
const formatSkillOption = (skill: SearchResultSkill, badge?: string): string => {
	const name = badge ? `${badge} ${pc.bold(skill.name)}` : pc.bold(skill.name);
	const author = pc.dim(`by ${skill.author}`);
	const stats =
		pc.yellow(`★ ${formatNumber(skill.stars)} Stars`) +
		pc.greenBright(` · ↓ ${formatNumber(skill.installs)} installs`);
	const desc = skill.description
		? `${pc.dim(skill.description.slice(0, 70))}${skill.description.length > 70 ? "..." : ""}`
		: "";
	return `${name} ${author} ${stats}\n${desc}\n`;
};

/**
 * Build select options from search results
 */
const buildSelectOptions = (
	skills: SearchResultSkill[],
	hasMore: boolean,
	currentSort: SortField,
	metaSkill: SearchResultSkill | null,
): Array<{ value: string; label: string; hint?: string }> => {
	const options: Array<{ value: string; label: string; hint?: string }> = [];

	// Meta skill as highlighted first option
	if (metaSkill) {
		options.push({
			value: INSTALL_META_SKILL_VALUE,
			label: formatSkillOption(metaSkill, pc.bgYellow(pc.black(" Meta Skill "))),
		});
	}

	// Skill results
	for (const skill of skills) {
		options.push({
			value: skill.namespace,
			label: formatSkillOption(skill),
		});
	}

	// Action options
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
		value: NEW_SEARCH_VALUE,
		label: pc.cyan("🔍 New search..."),
	});

	options.push({
		value: EXIT_VALUE,
		label: pc.dim("Exit"),
	});

	return options;
};



/**
 * Interactive search command
 */
export async function search(options: SearchOptions = {}): Promise<void> {
	const s = spinner();
	let fetchLimit = DEFAULT_LIMIT; // Can increase when re-sorting to preserve loaded count
	let offset = 0;
	let allSkills: SearchResultSkill[] = [];
	let total = 0;
	let initialSelectionIndex = 0; // Track where to position cursor after loading more

	// Fetch meta skill from API (same data format as search results)
  let metaSkill: SearchResultSkill | null = await fetchMetaSkill();

	// 1. Get search query (from options or prompt user)
	let query = options.query;
	if (!query) {
		const queryInput = await text({
			message: "Search for skills:",
			placeholder: "e.g., frontend, python, testing...",
			validate: validateSearchQuery,
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
				limit: fetchLimit,
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
		const selectOptions = buildSelectOptions(allSkills, hasMore, currentSort, metaSkill);

		// Set initial selection to the first newly loaded skill (or meta skill on initial load)
		const initialValue =
			initialSelectionIndex === 0
				? metaSkill
					? INSTALL_META_SKILL_VALUE
					: allSkills[0]?.namespace ?? selectOptions[0]?.value
				: allSkills[initialSelectionIndex]?.namespace;

		const selection = await select({
			message: `Select a skill to install (${allSkills.length} of ${total}):`,
			options: selectOptions,
			maxItems: MAX_VISIBLE_ITEMS,
			initialValue,
		});

		if (isCancel(selection)) {
			showExitMessage();
			return;
		}

		// Handle sort change
		if (selection === SORT_VALUE) {
			clearLines(Math.min(MAX_VISIBLE_ITEMS, selectOptions.length) + 3);
			const sortSelection = await select({
				message: "Sort results by:",
				options: SORT_OPTIONS,
				initialValue: currentSort,
			});

			if (isCancel(sortSelection)) {
				continue; // Go back to results
			}

			const newSort = sortSelection as SortField;
			if (newSort !== currentSort) {
				currentSort = newSort;
				// Re-fetch with new sort, preserving how many results user had loaded
				fetchLimit = Math.max(allSkills.length, DEFAULT_LIMIT);
				offset = 0;
				allSkills = [];
				initialSelectionIndex = 0;
			}
			continue;
		}

		// Handle pagination
		if (selection === LOAD_MORE_VALUE) {
			clearLines(Math.min(MAX_VISIBLE_ITEMS, selectOptions.length) + 3);
			initialSelectionIndex = allSkills.length;

			offset += fetchLimit;
			fetchLimit = DEFAULT_LIMIT; // Reset to default for subsequent loads
			continue;
		}

		// Handle new search
		if (selection === NEW_SEARCH_VALUE) {
			clearLines(Math.min(MAX_VISIBLE_ITEMS, selectOptions.length) + 3);
			const newQuery = await text({
				message: "Search for skills:",
				placeholder: "e.g., frontend, python, testing...",
				validate: validateSearchQuery,
			});

			if (isCancel(newQuery)) {
				continue;
			}

			query = newQuery as string;
			offset = 0;
			fetchLimit = DEFAULT_LIMIT;
			allSkills = [];
			initialSelectionIndex = 0;
			continue;
		}

		// Handle exit
		if (selection === EXIT_VALUE) {
			showExitMessage();
			return;
		}

		// 4. Skill selected - get details
		const selectedSkill =
			selection === INSTALL_META_SKILL_VALUE
				? metaSkill
				: allSkills.find((s) => s.namespace === selection);

		if (!selectedSkill) {
			throw new Error("Selected skill not found");
		}

		note(
			`${pc.bold(selectedSkill.name)}\n` +
				`Author: ${selectedSkill.author}\n` +
				`Stars: ${formatNumber(selectedSkill.stars)} · Installs: ${formatNumber(selectedSkill.installs)}`,
			"Selected Skill",
		);

		// 5. Determine scope and clients
		const scopeAndClients = await selectScopeAndClients({
			client: options.client,
			local: options.local,
			allowGoBack: true,
		});

		if (!scopeAndClients) {
			showExitMessage();
			return;
		}

		if (scopeAndClients === "back") {
			continue;
		}

		const { scope, clientIds } = scopeAndClients;
		const isLocal = scope === "local";

		// 6. Install the skill using existing install function
    await installSingleSkill({
      namespace: selectedSkill.namespace,
      name: selectedSkill.name,
      sourceUrl: selectedSkill.sourceUrl,
      relDir: selectedSkill.metadata.directoryPath
		},
			clientIds,
			isLocal,
		);

		// Ask user what to do next
		const nextAction = await select({
			message: "What would you like to do next?",
			options: [
				{ value: "continue", label: "Search for more skills" },
				{ value: "exit", label: "Exit" },
			],
		});

		if (isCancel(nextAction) || nextAction === "exit") {
			showExitMessage();
			return;
		}
	}
}
