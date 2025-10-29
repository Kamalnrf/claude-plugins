import type { Skill } from "@/lib/api";
import { MetricBadge } from "./MetricBadge";
import { GithubIcon } from "./ui/github";
import { StarIcon } from "./ui/star-icon";
import { DownloadIcon } from "./ui/download";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
} from "@/components/ui/breadcrumb";

interface SkillDetailHeaderProps {
	skill: Skill;
}

function formatNumber(num: number): string {
	if (num < 1000) return num.toString();
	if (num < 1000000)
		return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
	return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
}

export function SkillDetailHeader({ skill }: SkillDetailHeaderProps) {
	return (
		<header>
			{/* Breadcrumb Navigation */}
			<Breadcrumb className="mb-2">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink
							href="#"
							onClick={(e) => {
								e.preventDefault();
								window.history.back();
							}}
						>
							Skills
						</BreadcrumbLink>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			{/* Header with Metrics */}
			<div className="flex items-start justify-between gap-4 flex-wrap">
				{/* Left: Title & Repository Link */}
				<div className="flex-1 min-w-0">
					<h1 className="text-xl font-bold mb-2">{skill.name}</h1>
					<a
						href={skill.sourceUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center-safe gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors text-wrap"
					>
						<GithubIcon size={14} />
						<span className="truncate text-wrap">{skill.namespace.split('/').slice(0, 2).join('/')}</span>
					</a>
				</div>

				{/* Right: Metrics Badges */}
				<div className="flex items-center gap-2">
					<MetricBadge
						icon={StarIcon}
						value={formatNumber(skill.stars)}
						color="yellow"
					/>
					<MetricBadge
						icon={DownloadIcon}
						value={formatNumber(skill.installs)}
						color="blue"
					/>
				</div>
			</div>
      <p className="leading-relaxed line-clamp-2 text-sm text-foreground/90">{skill.description}</p>
		</header>
	);
}
