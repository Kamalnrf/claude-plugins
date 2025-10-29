import {
  Item,
  ItemHeader,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemFooter,
  ItemActions,
  ItemMedia,
} from "@/components/ui/item";
import { GithubIcon } from "@/components/ui/github";
import { PackageIcon } from "@/components/ui/package-icon";
import { StarIcon } from "@/components/ui/star-icon";
import { DownloadIcon } from "./ui/download";
import { MetricBadge } from "./MetricBadge";
import { InstallPlugin } from "./InstallPlugin";
import { SkillsSection } from "./SkillsSection";
import { type Plugin } from "@/lib/api";

export interface PluginCardProps {
  plugin: Plugin;
  onBadgeClick?: (keyword: string) => void;
}

function formatNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
}

export function PluginCard({ plugin, onBadgeClick }: PluginCardProps) {
  const hasSkills = plugin.skills && plugin.skills.length > 0;

  // Show keywords only if no skills available
  const keywords = plugin.keywords?.slice(0, 3) ?? [];
  const allBadges = plugin.category ? [plugin.category, ...keywords] : keywords;
  const badges = [...new Set(allBadges)]; // Remove duplicates
  const additionalBadges = badges.length > 3 ? [`${badges.length - 3}+`] : [];

  const handleBadgeClick = (badge: string) => {
    if (onBadgeClick) {
      onBadgeClick(badge);
    }
  };

  return (
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
                {plugin.name}
              </ItemTitle>

              <a
                href={plugin.gitUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                <GithubIcon size={12} className="shrink-0" />
                <span className="font-medium">{plugin.namespace}</span>
              </a>
            </ItemContent>
          </ItemHeader>
          <ItemActions>
            <MetricBadge
              icon={StarIcon}
              value={formatNumber(plugin.stars)}
              color="yellow"
            />
            <MetricBadge
              icon={DownloadIcon}
              value={formatNumber(plugin.downloads)}
              color="blue"
            />
          </ItemActions>
        </div>

        {/* Show Skills OR Keywords (prioritize skills) */}
        {hasSkills ? (
          <SkillsSection skills={plugin.skills} onSkillClick={handleBadgeClick} />
        ) : (
          badges.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 self-start">
              {badges.map((keyword) => (
                <button
                  key={keyword}
                  onClick={() => handleBadgeClick(keyword)}
                  className="px-2 py-0.5 text-[10px] font-medium bg-muted/50 text-muted-foreground rounded-md border border-border/30 border-dotted cursor-pointer hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  {keyword}
                </button>
              ))}
              {additionalBadges.map((badge) => (
                <span
                  key={badge}
                  className="px-2 py-0.5 text-[10px] font-medium bg-muted/50 text-muted-foreground rounded-md border border-border/30 border-dotted"
                >
                  {badge}
                </span>
              ))}
            </div>
          )
        )}
      </ItemHeader>

      <ItemDescription className="mt-3 mb-2 leading-relaxed line-clamp-2 text-sm text-foreground/90">
        {plugin.description}
      </ItemDescription>

      <ItemFooter className="w-full">
        <InstallPlugin namespace={plugin.namespace} name={plugin.name} />
      </ItemFooter>
    </Item>
  );
}
