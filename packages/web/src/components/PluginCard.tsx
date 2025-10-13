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
import { ArrowDownIcon } from "@/components/ui/arrow-down";
import { MetricBadge } from "./MetricBadge";
import { InstallCommand } from "./InstallCommand";

export interface Plugin {
  name: string;
  namespace: string;
  description: string;
  gitUrl: string;
  stars: number;
  downloads: number;
}

export interface PluginCardProps {
  plugin: Plugin;
}

function formatNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
}

export function PluginCard({ plugin }: PluginCardProps) {
  return (
    <Item
      variant="outline"
      size="sm"
      className="group hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 bg-card/50 backdrop-blur-sm"
    >
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

        <ItemActions>
          <MetricBadge
            icon={StarIcon}
            value={formatNumber(plugin.stars)}
            color="yellow"
          />
          <MetricBadge
            icon={ArrowDownIcon}
            value={formatNumber(plugin.downloads)}
            color="blue"
          />
        </ItemActions>
      </ItemHeader>

      <ItemDescription className="my-2 leading-relaxed line-clamp-2 text-xs">
        {plugin.description}
      </ItemDescription>

      <ItemFooter>
        <InstallCommand namespace={plugin.namespace} name={plugin.name} />
      </ItemFooter>
    </Item>
  );
}
