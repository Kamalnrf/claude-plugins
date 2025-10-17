import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Plugin } from "@/lib/api";
import { PluginCard } from "./PluginCard";

interface InfinitePluginListProps {
	initialPlugins: Plugin[];
	total: number;
	searchQuery: string;
	hasSkillsFilter?: boolean;
	onSearchChange?: (query: string) => void;
}

export default function InfinitePluginList({
	initialPlugins,
	total,
	searchQuery,
	hasSkillsFilter = false,
	onSearchChange,
}: InfinitePluginListProps) {
	const [plugins, setPlugins] = useState<Plugin[]>(initialPlugins);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(initialPlugins.length < total);
	const observerTarget = useRef<HTMLDivElement>(null);

	// Sync with parent when props change
	useEffect(() => {
		setPlugins(initialPlugins);
		setHasMore(initialPlugins.length < total);
	}, [initialPlugins, total]);

	const handleBadgeClick = (keyword: string) => {
		if (onSearchChange) {
			onSearchChange(keyword);
		}
	};

	const loadMore = useCallback(async () => {
		setIsLoading(true);
		try {
			const params = new URLSearchParams({
				q: searchQuery,
				limit: "20",
				offset: plugins.length.toString(),
			});

			if (hasSkillsFilter) {
				params.set("hasSkills", "true");
			}

			const response = await fetch(`/api/plugins?${params}`);
			const data = await response.json();

			if (data.plugins && data.plugins.length > 0) {
				setPlugins((prev) => [...prev, ...data.plugins]);
				setHasMore(plugins.length + data.plugins.length < data.total);
			} else {
				setHasMore(false);
			}
		} catch (error) {
			console.error("Failed to load more plugins:", error);
			setHasMore(false);
		} finally {
			setIsLoading(false);
		}
	}, [searchQuery, plugins, hasSkillsFilter]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !isLoading) {
					loadMore();
				}
			},
			{ threshold: 0.1, rootMargin: "100px" },
		);

		if (observerTarget.current) {
			observer.observe(observerTarget.current);
		}

		return () => observer.disconnect();
	}, [hasMore, isLoading, loadMore]);

	return (
		<>
			{/* Plugin List */}
			<div className="flex flex-col gap-1.5">
				{plugins.map((plugin) => (
					<PluginCard
						key={plugin.id}
						plugin={plugin}
						onBadgeClick={handleBadgeClick}
					/>
				))}
			</div>

			{/* Loading State */}
			{isLoading && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex items-center justify-center py-12"
				>
					<div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 px-4 py-3 rounded-full border border-border/30">
						<motion.div
							animate={{ rotate: 360 }}
							transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
						>
							<Loader2 className="w-4 h-4 text-primary" />
						</motion.div>
						<span>Loading more plugins...</span>
					</div>
				</motion.div>
			)}

			{/* Intersection Observer Target */}
			<div ref={observerTarget} className="h-4" />

			{/* End of Results */}
			{!hasMore && plugins.length > 0 && (
				<div className="text-center py-8">
					<p className="text-sm text-muted-foreground">
						Showing all {plugins.length} plugins
					</p>
				</div>
			)}
		</>
	);
}
