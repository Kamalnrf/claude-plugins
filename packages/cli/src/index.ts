#!/usr/bin/env bun
import { parseArgs } from "node:util";
import { installCommand } from "./commands/install";
import { removeCommand } from "./commands/remove";
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

      if (typeof args[0] !== 'string'){
        console.error("Invalid plugin name");
        process.exit(1);
      }

      await installCommand(args[0]);
      break;

    case "remove":
      if (args.length === 0) {
        console.error("Usage: claude-plugins remove <plugin-name>");
        process.exit(1);
      }

      if (typeof args[0] !== 'string'){
        console.error("Invalid plugin name");
        process.exit(1);
      }

      await removeCommand(args[0]);
      break;

    case "list":
      await listCommand();
      break;

    default:
      console.error("Unknown command. Available: install, remove, list, search");
      console.error("");
      console.error("Usage:");
      console.error("  claude-plugins install <plugin-identifier>");
      console.error("  claude-plugins remove <plugin-name>");
      console.error("  claude-plugins list");
      process.exit(1);
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
