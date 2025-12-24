#!/usr/bin/env node
import { intro, outro, cancel } from "@clack/prompts";
import pc from "picocolors";
import { install } from "./commands/install.js";
import { list } from "./commands/list.js";
import { getAvailableClients } from "./lib/client-config.js";

/**
 * Parse command-line arguments
 */
const parseArgs = (args: string[]) => {
	const flags: Record<string, string | boolean> = {};
	const positional: string[] = [];

	for (let i = 0; i < args.length; i++) {
		if (args[i]?.startsWith("--")) {
			const key = args[i]?.slice(2) ?? '';
			const next = args[i + 1];
			if (next && !next.startsWith("-")) {
				flags[key] = next;
				i++;
			} else {
				flags[key] = true;
			}
		} else if (args[i]?.startsWith("-")) {
			flags[args[i]?.slice(1) ?? ''] = true;
		} else {
			positional.push(args[i] ?? '');
		}
	}

	return { flags, positional };
};

/**
 * Show help message
 */
const showHelp = () => {
	console.log(`
${pc.bold("skills-installer")} - Install agent skills that comply with the agentskills spec

${pc.bold("COMMANDS:")}
  install <skill>    Install or update an agent skill
  list              List installed skills
  help              Show this help message

${pc.bold("OPTIONS:")}
  --client <name>   Target client (${getAvailableClients().join(", ")})
  --local, -l       Install locally to current directory

${pc.bold("EXAMPLES:")}
  ${pc.dim("# Install skill globally for claude-code")}
  skills-installer install @anthropic/claude-cookbooks/analyzing-financial-statements --client claude-code

  ${pc.dim("# Install skill locally (defaults to claude-code)")}
  skills-installer install @owner/repo/skill --local

  ${pc.dim("# Update an existing skill")}
  skills-installer install @anthropic/skills/frontend-design

  ${pc.dim("# List all installed skills")}
  skills-installer list

${pc.dim("Browse skills at https://claude-plugins.dev/skills")}
`);
};

/**
 * Main CLI entry point
 */
const main = async () => {
	const [command, ...cmdArgs] = process.argv.slice(2);

	intro(pc.bgCyan(pc.black(" skills-installer ")));

	// Show help if no command or help command
	if (!command || command === "help" || command === "--help" || command === "-h") {
		showHelp();
		process.exit(0);
	}

	const { flags, positional } = parseArgs(cmdArgs);

	try {
		switch (command) {
			case "install": {
				const skillId = positional[0];
				if (!skillId) {
					cancel("Skill identifier required");
					console.log(
						pc.dim("Usage: skills-installer install @owner/repo/skill"),
					);
					process.exit(1);
				}

				await install(skillId, {
					client: (flags.client as string) || "claude-code",
					local: !!(flags.local || flags.l),
				});
				break;
			}

			case "list": {
				await list({
					client: flags.client as string,
				});
				break;
			}

			default:
				cancel(`Unknown command: ${command}`);
				console.log(pc.dim('Run "skills-installer help" for usage'));
				process.exit(1);
		}

		outro(pc.green("Done!"));
	} catch (error) {
		cancel(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
};

main();
