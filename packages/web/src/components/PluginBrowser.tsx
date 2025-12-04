import { Search, Sparkles, SortDescIcon } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import type { Plugin } from "@/lib/api";
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

// Format number helper
function formatNumber(num: number): string {
	if (num < 1000) return num.toString();
	if (num < 10000) return num.toLocaleString("en-US");
	if (num < 1000000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
	return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
}

export default function PluginBrowser({
	initialPlugins,
	initialQuery,
	total: initialTotal,
	initialHasSkills,
	initialOrderBy = null,
	initialOrder = null,
}: PluginBrowserProps) {
	const [{ plugins, total }, setPlugins] = useState({
		plugins: initialPlugins,
		total: initialTotal,
	});

	// Search query from URL
	const getSearchQuery = () => {
		if (typeof window === "undefined") return initialQuery;
		const params = new URLSearchParams(window.location.search);
		return params.get("q") || "";
	};

	// Skills filter from URL
	const getSkillsFilter = (): boolean => {
		if (typeof window === "undefined") return initialHasSkills;
		return (
			new URLSearchParams(window.location.search).get("hasSkills") === "true"
		);
	};

	// Sort option from URL
	const getSortFromURL = (): SortOption => {
		if (typeof window === "undefined") {
			if (!initialOrderBy) return "relevance";
			return `${initialOrderBy}-${initialOrder || "desc"}` as SortOption;
		}

		const params = new URLSearchParams(window.location.search);
		const orderBy = params.get("orderBy");
		const order = params.get("order") || "desc";

		if (!orderBy) return "relevance";
		return `${orderBy}-${order}` as SortOption;
	};

	// Convert sort option to URL params
	const sortToParams = (
		sort: SortOption,
	): { orderBy?: string; order?: string } => {
		if (sort === "relevance") return {};

		const [orderBy, order] = sort.split("-");
		return { orderBy, order };
	};

	const [searchQuery, setSearchQuery] = useState(getSearchQuery());
	const [hasSkillsFilter, setHasSkillsFilter] = useState<boolean>(
		getSkillsFilter(),
	);
	const [sortOption, setSortOption] = useState<SortOption>(getSortFromURL());
	const deferredSearchQuery = useDeferredValue(searchQuery);

	// Fetch results when deferred query, filter, or sort changes
	useEffect(() => {
		const fetchPlugins = async () => {
			try {
				const params = new URLSearchParams({
					q: deferredSearchQuery,
					limit: "20",
					offset: "0",
				});

				if (hasSkillsFilter) {
					params.set("hasSkills", "true");
				}

				const { orderBy, order } = sortToParams(sortOption);
				if (orderBy) params.set("orderBy", orderBy);
				if (order) params.set("order", order);

				const response = await fetch(`/api/plugins?${params}`);
				const data = await response.json();

				setPlugins({
					plugins: data.plugins || [],
					total: data.total || 0,
				});
			} catch (error) {
				console.error("Failed to fetch plugins:", error);
			}
		};

		fetchPlugins();
	}, [deferredSearchQuery, hasSkillsFilter, sortOption]);

	const handleInputChange = (value: string) => {
		// Update URL immediately
		if (value === "") {
			const url = new URL(window.location.href);
			url.searchParams.delete("q");
			window.history.pushState({}, "", url.toString());
		} else {
			const url = new URL(window.location.href);
			url.searchParams.set("q", value);
			window.history.pushState({}, "", url.toString());
		}

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
			const { orderBy, order } = sortToParams(value);
			if (orderBy) url.searchParams.set("orderBy", orderBy);
			if (order) url.searchParams.set("order", order);
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
					<div className="text-xs font-medium text-muted-foreground/70 tabular-nums px-2.5 py-1 bg-muted/30 rounded-full border border-border/30">
						{formatNumber(total)} {total === 1 ? "plugin" : "plugins"}
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
							<option value="downloads-asc">Least Downloads</option>
							<option value="stars-desc">Most Stars</option>
							<option value="stars-asc">Least Stars</option>
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

						{/* Skills Filter Toggle */}
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
				searchQuery={searchQuery}
				hasSkillsFilter={hasSkillsFilter}
				onSearchChange={handleBadgeClick}
			/>
		</>
	);
}
