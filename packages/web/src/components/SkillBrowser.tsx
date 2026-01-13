import { Search, SortDescIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import type { Skill } from "@/lib/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { QueryProvider } from "./QueryProvider";
import InfiniteSkillList from "./InfiniteSkillList";

interface SkillBrowserProps {
	initialSkills: Skill[];
	initialQuery: string;
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

async function fetchSkills(
	query: string,
	sortOption: SortOption,
	signal?: AbortSignal,
): Promise<{ skills: Skill[]; total: number }> {
	const params = new URLSearchParams({
		q: query,
		limit: "20",
		offset: "0",
	});

	if (sortOption !== "relevance") {
		const [orderBy, order] = sortOption.split("-");
		params.set("orderBy", orderBy);
		params.set("order", order);
	}

	const response = await fetch(`/api/skills?${params}`, { signal });

	if (!response.ok) {
		let errorMessage = "";
		try {
			const errorData = await response.json();
			errorMessage = errorData.error || errorData.message || "";
		} catch {
			errorMessage = await response.text().catch(() => "");
		}
		throw new Error(
			`Failed to fetch skills: ${response.status} ${response.statusText}${errorMessage ? ` - ${errorMessage}` : ""}`,
		);
	}

	const data = await response.json();
	return { skills: data.skills || [], total: data.total || 0 };
}

function SkillBrowserInner({
	initialSkills,
	initialQuery,
	total: initialTotal,
	initialOrderBy = null,
	initialOrder = null,
}: SkillBrowserProps) {
	// Use initial props for first render to avoid hydration mismatch
	const getInitialSort = (): SortOption => {
		if (!initialOrderBy) return "relevance";
		return `${initialOrderBy}-${initialOrder || "desc"}` as SortOption;
	};

	const [searchQuery, setSearchQuery] = useState(initialQuery);
	const [sortOption, setSortOption] = useState<SortOption>(getInitialSort());
	const debouncedSearchQuery = useDebouncedValue(searchQuery.trim(), 500);

	const { data = { skills: initialSkills, total: initialTotal }, isFetching } = useQuery({
		queryKey: ["skills", debouncedSearchQuery, sortOption],
		queryFn: ({ signal }) => fetchSkills(debouncedSearchQuery, sortOption, signal),
		initialData: {
			skills: initialSkills,
			total: initialTotal,
		},
		initialDataUpdatedAt: 0,
		placeholderData: keepPreviousData,
	});

	const isLoading = searchQuery.trim() !== debouncedSearchQuery || isFetching;

	const { skills, total } = data;

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

	const handleBadgeClick = (tag: string) => {
		handleInputChange(tag);
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
						Skills
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
									{formatNumber(total)} {total === 1 ? "skill" : "skills"}
								</motion.span>
							)}
						</AnimatePresence>
					</div>
					<div className="relative">
						<select
							id="sort-select-skills"
							value={sortOption}
							onChange={handleSortChange}
							className="h-8 pl-2 pr-6 rounded-md border border-border/50 bg-background/50 text-xs font-medium text-muted-foreground hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
							aria-label="Sort skills"
						>
							<option value="relevance">Relevance</option>
							<option value="downloads-desc">Most Downloads</option>
							<option value="stars-desc">Most Stars</option>
						</select>
						<SortDescIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
					</div>
				</div>
				<form onSubmit={(e) => e.preventDefault()} aria-label="Search skills">
					<div className="relative group">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
						<Input
							type="search"
							name="q"
							value={searchQuery}
							onChange={(e) => handleInputChange(e.target.value)}
							placeholder="Search by name, author, or keyword..."
							aria-label="Search for agent skills"
							className="h-9 pl-9 text-base md:text-sm bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
						/>
					</div>
				</form>
			</section>
			<InfiniteSkillList
				initialSkills={skills}
				total={total}
				searchQuery={debouncedSearchQuery}
				onSearchChange={handleBadgeClick}
			/>
		</>
	);
}

export default function SkillBrowser(props: SkillBrowserProps) {
	return (
		<QueryProvider>
			<SkillBrowserInner {...props} />
		</QueryProvider>
	);
}
