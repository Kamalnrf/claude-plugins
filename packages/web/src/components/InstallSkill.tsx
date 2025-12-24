import { DownloadIcon } from "./ui/download";
import { ClaudeCodeIcon, ClaudeIcon } from "@/components/ui/claude-icons";
import { CommandBox } from "@/components/CommandBox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Skill } from "@/lib/api";

type Props = {
	skill: Skill; // Skill to use in example instructions
};

type Client = {
	id: string;
	name: string;
	icon: React.ReactNode;
};

const CLIENTS: Client[] = [
	{ id: "claude", name: "Claude", icon: <ClaudeIcon /> },
	{ id: "claude-code", name: "Claude Code", icon: <ClaudeCodeIcon /> },
];

export function InstallSkill({ skill }: Props) {
	const downloadUrl = `/api/download?namespace=${encodeURIComponent(skill.namespace)}`;

	const renderClaudeInstructions = () => {
		return (
			<div className="flex flex-col gap-4">
				{/* Step 1: Download skill */}
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<span className="inline-flex items-center justify-center px-1.5 py-0.5 bg-muted/50 text-foreground rounded border border-border/30 text-[10px] font-semibold font-mono">
							1
						</span>
						<span className="text-sm font-medium text-foreground">
							Download skill
						</span>
					</div>
					<button
						onClick={() => {
							window.location.href = downloadUrl;
						}}
						className="inline-flex items-center gap-1 px-3 py-2 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 rounded-md transition-colors text-xs font-medium w-fit cursor-pointer"
					>
						<DownloadIcon size={14} />
						{skill.name}.zip
					</button>
				</div>

				{/* Step 2: Go to Settings */}
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<span className="inline-flex items-center justify-center px-1.5 py-0.5 bg-muted/50 text-foreground rounded border border-border/30 text-[10px] font-semibold font-mono">
							2
						</span>
						<span className="text-sm font-medium text-foreground">
							Enable skills in Claude
						</span>
					</div>
					<p className="text-sm text-muted-foreground">
						Open{" "}
						<a
							href="https://claude.ai/settings/capabilities"
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:underline font-medium"
						>
							claude.ai/settings/capabilities
						</a>{" "}
						and find the "Skills" section
					</p>
				</div>

				{/* Step 3: Upload */}
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<span className="inline-flex items-center justify-center px-1.5 py-0.5 bg-muted/50 text-foreground rounded border border-border/30 text-[10px] font-semibold font-mono">
							3
						</span>
						<span className="text-sm font-medium text-foreground">
							Upload to Claude
						</span>
					</div>
					<p className="text-sm text-muted-foreground">
						Click "Upload skill" and select the downloaded ZIP file
					</p>
				</div>
			</div>
		);
	};

	const renderClaudeCodeInstructions = () => {
		const projectSkill = `npx skills-installer install ${skill.namespace} --local --client claude-code`;
		const personalSkill = `npx skills-installer install ${skill.namespace} --client claude-code`;

		return (
			<div className="flex flex-col gap-4">
  			<div className="flex flex-col gap-2">
  				<div className="flex items-center gap-2">
  					<span className="inline-flex items-center justify-center px-1.5 py-0.5 bg-muted/50 text-foreground rounded border border-border/30 text-[10px] font-semibold font-mono">
  						1.a
  					</span>
  					<span className="text-sm font-medium text-foreground">
  						As Personal Skill (default)
  					</span>
  				</div>
  				<p className="text-sm text-muted-foreground">
  					Applies to all projects globally.
  				</p>
  				<CommandBox command={personalSkill} />
  			</div>
				<div className="flex flex-col gap-2">
  				<div className="flex items-center gap-2">
  					<span className="inline-flex items-center justify-center px-1.5 py-0.5 bg-muted/50 text-foreground rounded border border-border/30 text-[10px] font-semibold font-mono">
  						1.b
  					</span>
  					<span className="text-sm font-medium text-foreground">
  						As Project Skill
  					</span>
  				</div>
					<p className="text-sm text-muted-foreground">
						Applies to current project only. Run this command in your project root.
					</p>
					<CommandBox command={projectSkill} />
				</div>
			</div>
		);
	};

	return (
		<div className="border border-border/50 rounded-lg bg-card/30 shadow backdrop-blur-sm p-2 py-3">
			<Tabs defaultValue="claude" className="w-full" orientation="vertical">
				<div className="flex flex-col md:flex-row gap-6">
					{/* Vertical tabs on the left */}
					<TabsList className="w-fit md:flex-col md:h-fit">
						{CLIENTS.map((client) => (
							<TabsTrigger
								key={client.id}
								value={client.id}
								className="gap-2 md:w-full md:justify-start"
							>
								<span className="flex-shrink-0">{client.icon}</span>
								<span>{client.name}</span>
							</TabsTrigger>
						))}
					</TabsList>

					{/* Content on the right */}
					<div className="flex-1 min-h-[270px] overflow-hidden flex flex-col justify-between">
						<TabsContent value="claude" className="mt-0">
							{renderClaudeInstructions()}
						</TabsContent>
						<TabsContent value="claude-code" className="mt-0">
							{renderClaudeCodeInstructions()}
						</TabsContent>
						{/* Note */}
						<div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md border border-border/50 mt-2">
							<strong>Note:</strong> Please verify skill by going through its
							instructions before using it.
						</div>
					</div>
				</div>
			</Tabs>
		</div>
	);
}
