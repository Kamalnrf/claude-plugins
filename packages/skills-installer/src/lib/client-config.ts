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
	// Future clients will be added here:
	// 'vscode': { ... },
	// 'cursor': { ... },
	// 'amp': { ... },
};

export const getClientConfig = (name: string): ClientConfig | undefined =>
	CLIENT_CONFIGS[name];

export const getAvailableClients = (): string[] => Object.keys(CLIENT_CONFIGS);
