#!/usr/bin/env node
import { parseArgs } from "node:util";
import { disableCommand } from "./commands/disable";
import { enableCommand } from "./commands/enable";
import { installCommand } from "./commands/install";
import { listCommand } from "./commands/list";
import { skillInstallCommand } from "./commands/skills/install";

const { positionals, values } = parseArgs({
	args: process.argv.slice(2),
	allowPositionals: true,
	options: {
		local: { type: "boolean", default: false },
	},
});

const [command, subcommand, ...args] = positionals;

async function main() {
	switch (command) {
		case "skills":
			switch (subcommand) {
				case "install":
					if (args.length === 0) {
						console.error(
							"Usage: claude-plugins skills install <skill-identifier> [--local]",
						);
						console.error("");
						console.error("Examples:");
						console.error(
							"  claude-plugins skills install @owner/repo/skill-name",
						);
						console.error(
							"  claude-plugins skills install @owner/repo/skill-name --local",
						);
						process.exit(1);
					}

					if (typeof args[0] !== "string") {
						console.error("Invalid skill identifier");
						process.exit(1);
					}

					await skillInstallCommand(args[0], values.local);
					break;

				default:
					console.error(`Unknown skills subcommand: ${subcommand}`);
					console.error("");
					console.error("Available commands:");
					console.error("  claude-plugins skills install <skill-identifier>");
					process.exit(1);
			}
			break;

		case "install":
			if (subcommand && args.length === 0) {
				// Handle case where subcommand is actually the plugin name
				await installCommand(subcommand);
				break;
			}

			if (!subcommand) {
				console.error("Usage: claude-plugins install <plugin-name>");
				process.exit(1);
			}

			await installCommand(subcommand);
			break;
		case "disable":
			if (!subcommand) {
				console.error("Usage: claude-plugins disable <plugin-name>");
				process.exit(1);
			}

			if (typeof subcommand !== "string") {
				console.error("Invalid plugin name");
				process.exit(1);
			}

			await disableCommand(subcommand);
			break;

		case "enable":
			if (!subcommand) {
				console.error("Usage: claude-plugins enable <plugin-name>");
				process.exit(1);
			}

			if (typeof subcommand !== "string") {
				console.error("Invalid plugin name");
				process.exit(1);
			}

			await enableCommand(subcommand);
			break;

		case "list":
			await listCommand();
			break;

		default:
			console.error(
				"Unknown command. Available: install, enable, disable, list, skills",
			);
			console.error("");
			console.error("Usage:");
			console.error("  claude-plugins install <plugin-identifier>");
			console.error("  claude-plugins enable <plugin-name>");
			console.error("  claude-plugins disable <plugin-name>");
			console.error("  claude-plugins list");
			console.error("");
			console.error("Skills:");
			console.error(
				"  claude-plugins skills install <skill-identifier> [--local]",
			);
			process.exit(1);
	}
}

main().catch((error) => {
	console.error("Error:", error);
	process.exit(1);
});
