import type { ReactNode } from "react";
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
import { AMPIcon } from "./ui/amp-icon";
import { GeminiIcon } from "./ui/gemini-icon";
import { HeartHandshakeIcon } from "./ui/heart-handshake-icon";
import { OpenClawIcon } from "./ui/openclaw-icon";
import { PiIcon } from "./ui/pi-icon";

type Props = {
	skill: Skill; // Skill to use in example instructions
};

type AgentBadge = {
	name: string;
	icon: ReactNode;
};

type CliTarget = {
	id: string;
	name: string;
	icon: ReactNode;
	clientId: string;
	description: string;
	projectPath: string;
	agents?: AgentBadge[];
};

const SHARED_AGENTS: AgentBadge[] = [
	{ name: "Codex", icon: <CodexIcon /> },
	{ name: "Amp", icon: <AMPIcon /> },
	{ name: "Warp", icon: <PackageIcon size={14} /> },
	{ name: "Cursor", icon: <CursorIcon /> },
	{ name: "OpenCode", icon: <OpenCodeIcon /> },
	{ name: "Cline", icon: <PackageIcon size={14} /> },
	{ name: "Gemini CLI", icon: <GeminiIcon /> },
	{ name: "GitHub Copilot", icon: <GithubIcon size={14} /> },
];

const CLI_TARGETS: CliTarget[] = [
	{
		id: "shared",
		name: "Shared",
		icon: <HeartHandshakeIcon size={16} />,
		clientId: "shared",
		description: "Installs to .agents/skills, used by Codex, Amp, Warp, Cursor, OpenCode, and more.",
		projectPath: ".agents/skills",
		agents: SHARED_AGENTS,
	},
	{
		id: "claude-code",
		name: "Claude Code",
		icon: <ClaudeCodeIcon />,
		clientId: "claude-code",
		description: "Installs to Claude Code's native skills folder.",
		projectPath: ".claude/skills",
	},
	{
		id: "openclaw",
		name: "OpenClaw",
		icon: <OpenClawIcon size={16} />,
		clientId: "openclaw",
		description: "Installs to OpenClaw's skills folder.",
		projectPath: "skills",
	},
	{
		id: "pi",
		name: "Pi",
		icon: <PiIcon size={16} />,
		clientId: "pi",
		description: "Installs to Pi's coding agent skills folder.",
		projectPath: ".pi/skills",
	},
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

	const renderCliInstructions = (target: CliTarget) => {
		const projectSkill = `skills-installer add ${skill.namespace} -p --client ${target.clientId}`;
		const personalSkill = `skills-installer add ${skill.namespace} --client ${target.clientId}`;

		return (
			<div className="flex flex-col gap-4">
				<div className="flex items-start gap-3 rounded-md border border-border/50 bg-muted/30 p-3">
					<span className="mt-0.5 inline-flex size-8 flex-shrink-0 items-center justify-center rounded-md bg-background text-foreground [&_svg]:size-4">
						{target.icon}
					</span>
					<div className="min-w-0 flex-1">
						<h3 className="text-sm font-medium text-foreground">{target.name}</h3>
						<p className="text-sm text-muted-foreground">{target.description}</p>
						{target.agents ? (
							<div className="mt-2 flex flex-wrap gap-1.5">
								{target.agents.map((agent) => (
									<span
										key={agent.name}
										className="inline-flex min-h-7 items-center gap-1 rounded-full border border-border/50 bg-background px-2 py-1 text-xs text-muted-foreground [&_svg]:size-3.5"
									>
										{agent.icon}
										{agent.name}
									</span>
								))}
							</div>
						) : null}
					</div>
				</div>

				<div className="grid gap-3 lg:grid-cols-2">
					<div className="flex flex-col gap-2">
						<div>
							<span className="text-sm font-medium text-foreground">Personal</span>
							<p className="text-sm text-muted-foreground">Available across projects.</p>
						</div>
						<CommandBoxWithRunner command={personalSkill} />
					</div>
					<div className="flex flex-col gap-2">
						<div>
							<span className="text-sm font-medium text-foreground">Project</span>
							<p className="text-sm text-muted-foreground">Writes to {target.projectPath}.</p>
						</div>
						<CommandBoxWithRunner command={projectSkill} />
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="border border-border/50 rounded-lg bg-card/30 shadow backdrop-blur-sm p-2 py-3">
			<Tabs defaultValue="shared" className="w-full" orientation="vertical">
				<div className="flex flex-col md:flex-row gap-6">
					{/* Vertical tabs on the left */}
					<div className="w-full md:w-auto md:overflow-x-visible overflow-auto">
						<TabsList className="w-fit md:flex-col md:h-fit">
							{CLI_TARGETS.map((target) => (
								<TabsTrigger
									key={target.id}
									value={target.id}
									className="gap-2 md:w-full md:justify-start whitespace-nowrap"
								>
									<span className="flex-shrink-0 [&_svg]:size-4">{target.icon}</span>
									<span>{target.name}</span>
								</TabsTrigger>
							))}
							<TabsTrigger
								value="claude"
								className="gap-2 md:w-full md:justify-start whitespace-nowrap"
							>
								<span className="flex-shrink-0 [&_svg]:size-4"><ClaudeIcon /></span>
								<span>Claude</span>
							</TabsTrigger>
						</TabsList>
					</div>

					{/* Content on the right */}
					<div className="flex-1 min-h-[270px] overflow-hidden flex flex-col justify-between">
						{CLI_TARGETS.map((target) => (
							<TabsContent key={target.id} value={target.id} className="mt-0">
								{renderCliInstructions(target)}
							</TabsContent>
						))}
						<TabsContent value="claude" className="mt-0">
							{renderClaudeInstructions()}
						</TabsContent>
						{/* Note */}
						<div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md border border-border/50 mt-2">
							<strong>Note:</strong> Review the skill instructions before using it.
						</div>
					</div>
				</div>
			</Tabs>
		</div>
	);
}
