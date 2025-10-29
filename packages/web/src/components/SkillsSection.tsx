import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SkillsSectionProps {
	skills: string[];
	maxVisible?: number;
	onSkillClick?: (skill: string) => void;
}

export function SkillsSection({
	skills,
	maxVisible = 3,
	onSkillClick,
}: SkillsSectionProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	if (!skills?.length) return null;

	const visibleSkills = isExpanded ? skills : skills.slice(0, maxVisible);
	const hasMore = skills.length > maxVisible;

	const handleSkillClick = (skill: string) => {
		if (onSkillClick) {
			onSkillClick(skill);
		}
	};

	return (
		<div className="flex flex-col gap-1.5 w-full self-start">
			<div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground/70">
				<Sparkles className="w-3 h-3" />
				<span>Skills</span>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 w-full">
				<AnimatePresence>
					{visibleSkills.map((skill, i) => (
						<motion.button
							key={skill}
							type="button"
							onClick={() => handleSkillClick(skill)}
							initial={{ opacity: 1, y: 0 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -5 }}
							transition={{ delay: i * 0.05 }}
							className="px-2 py-0.5 text-[10px] font-medium bg-muted/50 text-muted-foreground rounded-md border border-border/30 border-dotted cursor-pointer hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors text-center"
						>
							{skill}
						</motion.button>
					))}
				</AnimatePresence>
			</div>

			{hasMore && (
				<button
					type="button"
					onClick={() => setIsExpanded(!isExpanded)}
					aria-expanded={isExpanded}
					className="flex items-center gap-1 text-[10px] text-muted-foreground/70 hover:text-foreground transition-colors group"
				>
					<span>
						{isExpanded
							? "Show less"
							: `Show ${skills.length - maxVisible} more skill${
									skills.length - maxVisible === 1 ? "" : "s"
								}`}
					</span>
					<ChevronDown
						className={`w-3 h-3 transition-transform ${
							isExpanded ? "rotate-180" : ""
						}`}
					/>
				</button>
			)}
		</div>
	);
}
