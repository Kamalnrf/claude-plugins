#!/usr/bin/env node
import { intro, outro, cancel } from "@clack/prompts";
import pc from "picocolors";
import { install } from "./commands/install.js";
import { list } from "./commands/list.js";
import { search } from "./commands/search.js";
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
  search [query]     Search for skills in the registry
  list               List installed skills
  help               Show this help message

${pc.bold("OPTIONS:")}
  --client <name>   Target client (${getAvailableClients().join(", ")})
  --local, -l       Install locally to current directory

${pc.bold("INSTALL FORMATS:")}
  ${pc.dim("# From registry")}
  @owner/repo/skill-name

  ${pc.dim("# From GitHub (clone + pick skills)")}
  owner/repo
  github.com/owner/repo
  https://github.com/owner/repo
  git@github.com:owner/repo.git

  ${pc.dim("# Direct path to skill in repo")}
  https://github.com/owner/repo/tree/main/skills/skill-name

${pc.bold("EXAMPLES:")}
  ${pc.dim("# Search for skills interactively")}
  skills-installer search

  ${pc.dim("# Search with a query")}
  skills-installer search "frontend design"

  ${pc.dim("# Install from registry")}
  skills-installer install @anthropic/claude-cookbooks/analyzing-financial-statements

  ${pc.dim("# Install all skills from a GitHub repo")}
  skills-installer install vercel-labs/agent-skills

  ${pc.dim("# Install specific skill from a repo URL")}
  skills-installer install https://github.com/vercel-labs/agent-skills/tree/main/skills/frontend-design

  ${pc.dim("# Install locally (defaults to claude-code)")}
  skills-installer install owner/repo --local

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

			case "search": {
				const query = positional[0];
				await search({
					query,
					client: flags.client as string | undefined,
					local: !!(flags.local || flags.l),
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
