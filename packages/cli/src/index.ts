#!/usr/bin/env node
import { parseArgs } from "node:util";
import { disableCommand } from "./commands/disable";
import { enableCommand } from "./commands/enable";
import { installCommand } from "./commands/install";
import { listCommand } from "./commands/list";

const { positionals } = parseArgs({
	args: process.argv.slice(2),
	allowPositionals: true,
});

const [command, ...args] = positionals;

async function main() {
	switch (command) {
		case "install":
			if (args.length === 0) {
				console.error("Usage: claude-plugins install <plugin-name>");
				process.exit(1);
			}

			if (typeof args[0] !== "string") {
				console.error("Invalid plugin name");
				process.exit(1);
			}

			await installCommand(args[0]);
			break;
		case "disable":
			if (args.length === 0) {
				console.error("Usage: claude-plugins disable <plugin-name>");
				process.exit(1);
			}

			if (typeof args[0] !== "string") {
				console.error("Invalid plugin name");
				process.exit(1);
			}

			await disableCommand(args[0]);
			break;

		case "enable":
			if (args.length === 0) {
				console.error("Usage: claude-plugins enable <plugin-name>");
				process.exit(1);
			}

			if (typeof args[0] !== "string") {
				console.error("Invalid plugin name");
				process.exit(1);
			}

			await enableCommand(args[0]);
			break;

		case "list":
			await listCommand();
			break;

		default:
			console.error(
				"Unknown command. Available: install, enable, disable, list",
			);
			console.error("");
			console.error("Usage:");
			console.error("  claude-plugins install <plugin-identifier>");
			console.error("  claude-plugins enable <plugin-name>");
			console.error("  claude-plugins disable <plugin-name>");
			console.error("  claude-plugins list");
			process.exit(1);
	}
}

main().catch((error) => {
	console.error("Error:", error);
	process.exit(1);
});
