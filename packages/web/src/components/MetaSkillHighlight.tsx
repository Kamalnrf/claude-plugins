import {
	Item,
	ItemHeader,
	ItemContent,
	ItemTitle,
	ItemDescription,
	ItemActions,
	ItemMedia,
} from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import { BookmarkPlusIcon } from "./ui/bookmark-plus-icon";
import { ArrowRightIcon } from "./ui/arrow-right";

export function MetaSkillHighlight() {
	return (
		<a href="/skills/@Kamalnrf/claude-plugins/skills-discovery" className="block">
			<Item
				variant="outline"
				size="sm"
				className="group hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 bg-card/50 backdrop-blur-sm"
			>
				<ItemHeader className="flex flex-col justify-start">
					<div className="flex w-full justify-between items-start">
						<ItemHeader>
							<ItemMedia variant="icon" className="bg-primary/10 size-7">
								<BookmarkPlusIcon size={14} />
							</ItemMedia>

							<ItemContent>
								<div className="flex items-center gap-2">
									<span className="px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-md border border-primary/20">
										Meta Skill
									</span>
								</div>
								<ItemTitle className="text-sm group-hover:text-primary transition-colors">
									Search & Install Skills from Your Terminal
								</ItemTitle>
							</ItemContent>
						</ItemHeader>
					</div>
				</ItemHeader>
				<ItemContent className="flex-row items-end w-full justify-between">
				  <ItemDescription className="leading-relaxed text-sm text-foreground/90">
  					This skill teaches your agent how to browse this registry, compare, and install skills. All within Claude Code, Cursor, Codex, and other agents. No context switching.
  				</ItemDescription>
					<ItemActions>
						<Button
							variant="outline"
							size="sm"
							className="group-hover:border-primary/50 group-hover:text-primary transition-colors"
						>
							<span className="hidden sm:inline">Install</span>
							<ArrowRightIcon size={14} />
						</Button>
					</ItemActions>
				</ItemContent>
			</Item>
		</a>
	);
}
