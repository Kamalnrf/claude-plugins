import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { ClientConfig } from "../types.js";

const home = homedir();
const configHome = process.env.XDG_CONFIG_HOME?.trim() || join(home, ".config");
const claudeHome = process.env.CLAUDE_CONFIG_DIR?.trim() || join(home, ".claude");

const getOpenClawGlobalDir = (): string => {
	if (existsSync(join(home, ".openclaw"))) {
		return join(home, ".openclaw", "skills");
	}
	if (existsSync(join(home, ".clawdbot"))) {
		return join(home, ".clawdbot", "skills");
	}
	if (existsSync(join(home, ".moltbot"))) {
		return join(home, ".moltbot", "skills");
	}
	return join(home, ".openclaw", "skills");
};

// Primary install targets. Many agents now read project skills from .agents/skills.
export const CLIENT_CONFIGS: Record<string, ClientConfig> = {
	"shared": {
		name: "Shared (.agents/skills)",
		globalDir: join(configHome, "agents", "skills"),
		localDir: join(process.cwd(), ".agents", "skills"),
	},
	"claude-code": {
		name: "Claude Code",
		globalDir: join(claudeHome, "skills"),
		localDir: join(process.cwd(), ".claude", "skills"),
	},
	"openclaw": {
		name: "OpenClaw",
		globalDir: getOpenClawGlobalDir(),
		localDir: join(process.cwd(), "skills"),
	},
	"pi": {
		name: "Pi",
		globalDir: join(home, ".pi", "agent", "skills"),
		localDir: join(process.cwd(), ".pi", "skills"),
	},
};

const CLIENT_ALIASES: Record<string, string> = {
	"agents": "shared",
	"amp": "shared",
	"antigravity": "shared",
	"cline": "shared",
	"codex": "shared",
	"cursor": "shared",
	"deepagents": "shared",
	"dexto": "shared",
	"firebender": "shared",
	"gemini": "shared",
	"gemini-cli": "shared",
	"github": "shared",
	"github-copilot": "shared",
	"kimi-cli": "shared",
	"opencode": "shared",
	"replit": "shared",
	"vscode": "shared",
	"warp": "shared",
};

export const getClientConfig = (name: string): ClientConfig | undefined =>
	CLIENT_CONFIGS[name] ?? CLIENT_CONFIGS[CLIENT_ALIASES[name] ?? ""];

export const getAvailableClients = (): string[] => Object.keys(CLIENT_CONFIGS);
