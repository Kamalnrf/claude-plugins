import { homedir } from "node:os";
import { join } from "node:path";
import type { ClientConfig } from "../types.js";

// Client configurations
export const CLIENT_CONFIGS: Record<string, ClientConfig> = {
	"claude-code": {
		name: "Claude Code",
		globalDir: join(homedir(), ".claude", "skills"),
		localDir: join(process.cwd(), ".claude", "skills"),
	},
	"codex": {
		name: "Codex",
		globalDir: join(homedir(), ".codex", "skills"),
		localDir: join(process.cwd(), ".codex", "skills"),
	},
	"cursor": {
		name: "Cursor",
		localDir: join(process.cwd(), ".cursor", "skills"),
	},
	"github": {
		name: "GitHub",
		localDir: join(process.cwd(), ".github", "skills"),
	},
	"letta": {
		name: "Letta",
		localDir: join(process.cwd(), ".skills"),
	},
	"vscode": {
		name: "VS Code",
		localDir: join(process.cwd(), ".github", "skills"),
	},
	"amp": {
		name: "AMP",
		globalDir: join(homedir(), ".config", "agents", "skills"),
		localDir: join(process.cwd(), ".agents", "skills"),
	},
	"goose": {
		name: "Goose",
		globalDir: join(homedir(), ".config", "goose", "skills"),
		localDir: join(process.cwd(), ".agents", "skills"),
	},
	"opencode": {
		name: "OpenCode",
		globalDir: join(homedir(), ".opencode", "skill"),
		localDir: join(process.cwd(), ".opencode", "skill"),
	},
	"gemini": {
		name: "Gemini CLI",
		globalDir: join(homedir(), ".gemini", "skills"),
		localDir: join(process.cwd(), ".gemini", "skills"),
	},
	"windsurf": {
		name: "Windsurf",
		globalDir: join(homedir(), ".codeium", "windsurf", "skills"),
		localDir: join(process.cwd(), ".windsurf", "skills"),
	},
};

export const getClientConfig = (name: string): ClientConfig | undefined =>
	CLIENT_CONFIGS[name];

export const getAvailableClients = (): string[] => Object.keys(CLIENT_CONFIGS);
