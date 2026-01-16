import { DownloadIcon } from "./ui/download";
import { ClaudeCodeIcon, ClaudeIcon } from "@/components/ui/claude-icons";
import { PackageIcon } from "@/components/ui/package-icon";
import { CommandBoxWithRunner } from "@/components/CommandBoxWithRunner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Skill } from "@/lib/api";
import { CodexIcon } from "./ui/codex-icon";
import { CursorIcon } from "./ui/cursor-icon";
import { OpenCodeIcon } from "./ui/open-code";
import { GithubIcon } from "./ui/github";
import { VSCodeIcon } from "./ui/vs-code-icon";
import { AMPIcon } from "./ui/amp-icon";
import { GooseIcon } from "./ui/goose-icon";
import { LettaIcon } from "./ui/letta-icon";
import { GeminiIcon } from "./ui/gemini-icon";
import { WindsurfIcon } from "./ui/windsurf-icon";
import { AntigravityIcon } from "./ui/antigravity-icon";

type Props = {
	skill: Skill; // Skill to use in example instructions
};

type Client = {
	id: string;
	name: string;
	icon: React.ReactNode;
	supportsGlobal: boolean;
};

const CLIENTS: Client[] = [
	{ id: "claude", name: "Claude", icon: <ClaudeIcon />, supportsGlobal: false },
	{ id: "claude-code", name: "Claude Code", icon: <ClaudeCodeIcon />, supportsGlobal: true },
	{ id: "opencode", name: "Open Code", icon: <OpenCodeIcon />, supportsGlobal: true },
	{ id: "amp", name: "Amp Code", icon: <AMPIcon />, supportsGlobal: true },
	{ id: "codex", name: "Codex", icon: <CodexIcon />, supportsGlobal: true },
	{ id: "cursor", name: "Cursor", icon: <CursorIcon />, supportsGlobal: false },
	{ id: "vscode", name: "VS Code", icon: <VSCodeIcon />, supportsGlobal: false },
	{ id: "letta", name: "Letta", icon: <LettaIcon />, supportsGlobal: false },
	{ id: "goose", name: "Goose", icon: <GooseIcon />, supportsGlobal: false },
	{ id: "gemini", name: "Gemini CLI", icon: <GeminiIcon />, supportsGlobal: true },
	{ id: "antigravity", name: "Antigravity", icon: <AntigravityIcon />, supportsGlobal: true },
	{ id: "windsurf", name: "Windsurf", icon: <WindsurfIcon />, supportsGlobal: true },
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

	const renderCliInstructions = (clientId: string, supportsGlobal: boolean) => {
		const projectSkill = `skills-installer install ${skill.namespace} --local --client ${clientId}`;
		const personalSkill = `skills-installer install ${skill.namespace} --client ${clientId}`;

		return (
			<div className="flex flex-col gap-4">
				{supportsGlobal ? (
					<>
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
							<CommandBoxWithRunner command={personalSkill} />
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
							<CommandBoxWithRunner command={projectSkill} />
						</div>
					</>
				) : (
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<span className="inline-flex items-center justify-center px-1.5 py-0.5 bg-muted/50 text-foreground rounded border border-border/30 text-[10px] font-semibold font-mono">
								1
							</span>
							<span className="text-sm font-medium text-foreground">
								Install as Project Skill
							</span>
						</div>
						<p className="text-sm text-muted-foreground">
							Run this command in your project root.
						</p>
						<CommandBoxWithRunner command={projectSkill} />
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="border border-border/50 rounded-lg bg-card/30 shadow backdrop-blur-sm p-2 py-3">
			<Tabs defaultValue="claude" className="w-full" orientation="vertical">
				<div className="flex flex-col md:flex-row gap-6">
					{/* Vertical tabs on the left */}
					<div className="w-full md:w-auto overflow-x-auto md:overflow-x-visible">
						<TabsList className="w-fit md:flex-col md:h-fit">
							{CLIENTS.map((client) => (
								<TabsTrigger
									key={client.id}
									value={client.id}
									className="gap-2 md:w-full md:justify-start whitespace-nowrap"
								>
									<span className="flex-shrink-0">{client.icon}</span>
									<span>{client.name}</span>
								</TabsTrigger>
							))}
						</TabsList>
					</div>

					{/* Content on the right */}
					<div className="flex-1 min-h-[270px] overflow-hidden flex flex-col justify-between">
						<TabsContent value="claude" className="mt-0">
							{renderClaudeInstructions()}
						</TabsContent>
						{CLIENTS.filter((c) => c.id !== "claude").map((client) => (
							<TabsContent key={client.id} value={client.id} className="mt-0">
								{renderCliInstructions(client.id, client.supportsGlobal)}
							</TabsContent>
						))}
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
