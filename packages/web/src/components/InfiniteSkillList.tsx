import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Skill } from "@/lib/api";
import { SkillCard } from "./SkillCard";

interface InfiniteSkillListProps {
	initialSkills: Skill[];
	total: number;
	searchQuery: string;
	onSearchChange?: (query: string) => void;
}

export default function InfiniteSkillList({
	initialSkills,
	total,
	searchQuery,
	onSearchChange,
}: InfiniteSkillListProps) {
	const [skills, setSkills] = useState<Skill[]>(initialSkills);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(initialSkills.length < total);
	const observerTarget = useRef<HTMLDivElement>(null);

	// Sync with parent when props change
	useEffect(() => {
		setSkills(initialSkills);
		setHasMore(initialSkills.length < total);
	}, [initialSkills, total]);

	const handleBadgeClick = (tag: string) => {
		if (onSearchChange) {
			onSearchChange(tag);
		}
	};

	const loadMore = useCallback(async () => {
		setIsLoading(true);
		try {
			const params = new URLSearchParams({
				q: searchQuery,
				limit: "20",
				offset: skills.length.toString(),
			});

			const response = await fetch(`/api/skills?${params}`);
			const data = await response.json();

			if (data.skills && data.skills.length > 0) {
				setSkills((prev) => [...prev, ...data.skills]);
				setHasMore(skills.length + data.skills.length < data.total);
			} else {
				setHasMore(false);
			}
		} catch (error) {
			console.error("Failed to load more skills:", error);
			setHasMore(false);
		} finally {
			setIsLoading(false);
		}
	}, [searchQuery, skills]);

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
			{/* Skills List */}
			<div className="flex flex-col gap-1.5">
				{skills.map((skill) => (
					<SkillCard
						key={skill.id}
						skill={skill}
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
						<span>Loading more skills...</span>
					</div>
				</motion.div>
			)}

			{/* Intersection Observer Target */}
			<div ref={observerTarget} className="h-4" />

			{/* End of Results */}
			{!hasMore && skills.length > 0 && (
				<div className="text-center py-8">
					<p className="text-sm text-muted-foreground">
						Showing all {skills.length} skills
					</p>
				</div>
			)}
		</>
	);
}
