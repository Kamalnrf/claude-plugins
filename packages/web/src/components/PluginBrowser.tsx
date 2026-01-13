import { Search, Sparkles, SortDescIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import type { Plugin } from "@/lib/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { QueryProvider } from "./QueryProvider";
import InfinitePluginList from "./InfinitePluginList";

interface PluginBrowserProps {
	initialPlugins: Plugin[];
	initialQuery: string;
	initialHasSkills: boolean;
	total: number;
	initialOrderBy?: "downloads" | "stars" | null;
	initialOrder?: "asc" | "desc" | null;
}

type SortOption =
	| "relevance"
	| "downloads-desc"
	| "downloads-asc"
	| "stars-desc"
	| "stars-asc";

function formatNumber(num: number): string {
	if (num < 1000) return num.toString();
	if (num < 10000) return num.toLocaleString("en-US");
	if (num < 1000000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
	return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
}

async function fetchPlugins(
	query: string,
	sortOption: SortOption,
	hasSkills: boolean,
	signal?: AbortSignal,
): Promise<{ plugins: Plugin[]; total: number }> {
	const params = new URLSearchParams({
		q: query,
		limit: "20",
		offset: "0",
	});

	if (hasSkills) {
		params.set("hasSkills", "true");
	}

	if (sortOption !== "relevance") {
		const [orderBy, order] = sortOption.split("-");
		params.set("orderBy", orderBy);
		params.set("order", order);
	}

	const response = await fetch(`/api/plugins?${params}`, { signal });

	if (!response.ok) {
		let errorMessage = "";
		try {
			const errorData = await response.json();
			errorMessage = errorData.error || errorData.message || "";
		} catch {
			errorMessage = await response.text().catch(() => "");
		}
		throw new Error(
			`Failed to fetch plugins: ${response.status} ${response.statusText}${errorMessage ? ` - ${errorMessage}` : ""}`,
		);
	}

	const data = await response.json();
	return { plugins: data.plugins || [], total: data.total || 0 };
}

function PluginBrowserInner({
	initialPlugins,
	initialQuery,
	total: initialTotal,
	initialHasSkills,
	initialOrderBy = null,
	initialOrder = null,
}: PluginBrowserProps) {
	// Use initial props for first render to avoid hydration mismatch
	const getInitialSort = (): SortOption => {
		if (!initialOrderBy) return "relevance";
		return `${initialOrderBy}-${initialOrder || "desc"}` as SortOption;
	};

	const [searchQuery, setSearchQuery] = useState(initialQuery);
	const [hasSkillsFilter, setHasSkillsFilter] = useState(initialHasSkills);
	const [sortOption, setSortOption] = useState<SortOption>(getInitialSort());
	const debouncedSearchQuery = useDebouncedValue(searchQuery.trim(), 500);

	const [initialDataUpdatedAt] = useState(() => Date.now());
	const { data = { plugins: initialPlugins, total: initialTotal }, isFetching } = useQuery({
		queryKey: ["plugins", debouncedSearchQuery, sortOption, hasSkillsFilter],
		queryFn: ({ signal }) =>
			fetchPlugins(debouncedSearchQuery, sortOption, hasSkillsFilter, signal),
		initialData: {
			plugins: initialPlugins,
			total: initialTotal,
		},
		initialDataUpdatedAt,
		placeholderData: keepPreviousData,
	});

	const { plugins, total } = data;
	const isLoading = searchQuery.trim() !== debouncedSearchQuery || isFetching;

	const handleInputChange = (value: string) => {
		const url = new URL(window.location.href);
		if (value === "") {
			url.searchParams.delete("q");
		} else {
			url.searchParams.set("q", value);
		}
		window.history.pushState({}, "", url.toString());
		setSearchQuery(value);
	};

	const handleBadgeClick = (keyword: string) => {
		handleInputChange(keyword);
	};

	const handleSkillsFilterToggle = () => {
		const newValue = !hasSkillsFilter;
		setHasSkillsFilter(newValue);

		const url = new URL(window.location.href);
		if (newValue) {
			url.searchParams.set("hasSkills", "true");
		} else {
			url.searchParams.delete("hasSkills");
		}
		window.history.pushState({}, "", url.toString());
	};

	const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value as SortOption;
		setSortOption(value);

		const url = new URL(window.location.href);
		if (value === "relevance") {
			url.searchParams.delete("orderBy");
			url.searchParams.delete("order");
		} else {
			const [orderBy, order] = value.split("-");
			url.searchParams.set("orderBy", orderBy);
			url.searchParams.set("order", order);
		}
		window.history.pushState({}, "", url.toString());
	};

	return (
		<>
			<section className="flex flex-col gap-3 sticky top-0 z-10 backdrop-blur-md bg-background/80 pt-2">
				<div className="flex items-center gap-2">
					<h2 className="text-base font-semibold text-foreground/90 tracking-tight">
						Plugins
					</h2>
					<div className="flex-1 h-px bg-border/30"></div>
					<div className="text-xs font-medium text-muted-foreground/70 tabular-nums px-2.5 py-1 bg-muted/30 rounded-full border border-border/30 min-w-[70px] flex items-center justify-center">
						<AnimatePresence mode="wait">
							{isLoading ? (
								<motion.div
									key="loading"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.15 }}
								>
									<Loader2 className="w-3 h-4 animate-spin" />
								</motion.div>
							) : (
								<motion.span
									key="count"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.15 }}
								>
									{formatNumber(total)} {total === 1 ? "plugin" : "plugins"}
								</motion.span>
							)}
						</AnimatePresence>
					</div>
					<div className="relative">
						<select
							id="sort-select"
							value={sortOption}
							onChange={handleSortChange}
							className="h-8 pl-2 pr-6 rounded-md border border-border/50 bg-background/50 text-xs font-medium text-muted-foreground hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
							aria-label="Sort plugins"
						>
							<option value="relevance">Relevance</option>
							<option value="downloads-desc">Most Downloads</option>
							<option value="stars-desc">Most Stars</option>
						</select>
						<SortDescIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
					</div>
				</div>
				<form onSubmit={(e) => e.preventDefault()} aria-label="Search plugins">
					<div className="flex flex-row gap-2">
						<div className="relative group flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
							<Input
								type="search"
								name="q"
								value={searchQuery}
								onChange={(e) => handleInputChange(e.target.value)}
								placeholder="Search by name, author, or keyword..."
								aria-label="Search for Claude Code plugins"
								className="h-9 pl-9 text-base md:text-sm bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
							/>
						</div>

						<button
							type="button"
							onClick={handleSkillsFilterToggle}
							role="switch"
							aria-checked={hasSkillsFilter}
							aria-label="Filter plugins with skills"
							className={`flex items-center justify-center h-9 px-2.5 md:px-3 md:gap-2 text-sm font-medium rounded-lg border transition-all shrink-0 ${
								hasSkillsFilter
									? "bg-primary/10 text-foreground border-primary/40 hover:border-primary/60"
									: "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/50 hover:border-primary/30"
							}`}
						>
							<Sparkles className="w-3.5 h-3.5" />
							<span className="hidden md:inline">With Skills</span>
						</button>
					</div>
				</form>
			</section>
			<InfinitePluginList
				initialPlugins={plugins}
				total={total}
				searchQuery={debouncedSearchQuery}
				hasSkillsFilter={hasSkillsFilter}
				onSearchChange={handleBadgeClick}
			/>
		</>
	);
}

export default function PluginBrowser(props: PluginBrowserProps) {
	return (
		<QueryProvider>
			<PluginBrowserInner {...props} />
		</QueryProvider>
	);
}
