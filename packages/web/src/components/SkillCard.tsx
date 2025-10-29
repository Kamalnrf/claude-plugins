import { GithubIcon } from "@/components/ui/github";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemHeader,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { StarIcon } from "@/components/ui/star-icon";
import type { Skill } from "@/lib/api";
import { MetricBadge } from "./MetricBadge";
import { DownloadIcon } from "./ui/download";
import { PackageIcon } from "@/components/ui/package-icon";
import { Button } from "./ui/button";

export interface SkillCardProps {
	skill: Skill;
	onBadgeClick?: (tag: string) => void;
}

function formatNumber(num: number): string {
	if (num < 1000) return num.toString();
	if (num < 1000000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
	return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
}

export function SkillCard({ skill }: SkillCardProps) {
	return (
		<a href={`/skills/${skill.namespace}`} className="block">
			<Item
				variant="outline"
				size="sm"
				className="group hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 bg-card/50 backdrop-blur-sm"
			>
				<ItemHeader className="flex flex-col justify-start">
					<div className="flex w-full justify-between">
						<ItemHeader>
							<ItemMedia variant="icon" className="bg-primary/10 size-7">
								<PackageIcon size={14} className="text-primary" />
							</ItemMedia>

							<ItemContent>
								<ItemTitle className="text-sm group-hover:text-primary transition-colors">
									{skill.name}
								</ItemTitle>

								<a
									href={skill.sourceUrl}
									target="_blank"
									rel="noopener noreferrer"
									onClick={(e) => e.stopPropagation()}
									className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
								>
									<GithubIcon size={12} className="shrink-0" />
									<span className="font-medium">{skill.namespace.split('/').slice(0, 2).join('/')}</span>
								</a>
							</ItemContent>
						</ItemHeader>
						<ItemActions>
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
						</ItemActions>
					</div>
				</ItemHeader>
				<ItemContent className="flex-row items-end w-full justify-between">
					<ItemDescription className="mt-3 mb-2 leading-relaxed line-clamp-2 text-sm text-foreground/90">
						{skill.description}
					</ItemDescription>
					<Button variant="outline" size="sm">
						learn more
					</Button>
				</ItemContent>
			</Item>
		</a>
	);
}
