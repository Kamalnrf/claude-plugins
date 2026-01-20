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
${pc.bold(pc.cyan("skills-installer"))} ${pc.dim("—")} Install agent skills

${pc.bold(pc.yellow("COMMANDS:"))}
  ${pc.green("search")} [query]             ${pc.dim("Search across all public skills on GitHub")}
  ${pc.green("install")} owner              ${pc.dim("Browse all skills from owner's repos")}
  ${pc.green("install")} owner/repo         ${pc.dim("Browse skills in a specific repo")}
  ${pc.green("install")} owner/repo/skill   ${pc.dim("Install a specific skill")}
  ${pc.green("install")} <git-url>          ${pc.dim("HTTPS, SSH, or direct path to skill")}
  ${pc.green("list")}                       ${pc.dim("List installed skills")}

${pc.bold(pc.yellow("EXAMPLES:"))}
  ${pc.cyan("$")} skills-installer search ${pc.magenta('frontend')}
  ${pc.cyan("$")} skills-installer install ${pc.magenta("anthropics")}
  ${pc.cyan("$")} skills-installer install ${pc.magenta("anthropics/claude-code")}

${pc.bold(pc.yellow("OPTIONS:"))}
  ${pc.blue("--client")} <name>   Target client (${getAvailableClients().join(", ")})
  ${pc.blue("--project")}, ${pc.blue("-p")}     Install to current project directory

${pc.dim("Browse skills at")} ${pc.underline(pc.cyan("https://claude-plugins.dev/skills"))}
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

				const useProject = !!(flags.project || flags.p || flags.local || flags.l);
				if (flags.local || flags.l) {
					console.log(pc.dim("Note: --local is deprecated, use --project instead"));
				}

				await install(skillId, {
					client: flags.client as string,
					local: useProject,
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
				const useProjectSearch = !!(flags.project || flags.p || flags.local || flags.l);
				if (flags.local || flags.l) {
					console.log(pc.dim("Note: --local is deprecated, use --project instead"));
				}

				await search({
					query,
					client: flags.client as string | undefined,
					local: useProjectSearch,
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
