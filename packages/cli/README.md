# Claude Plugins CLI

A CLI tool to install and manage Claude Code plugins.
Browse and discover available plugins at [claude-plugins.dev](https://claude-plugins.dev).

## Features

- **Simple CLI** — Clean, intuitive command-line interface
- **Universal Registry** — Access all public Claude Code plugins
- **Enable/Disable** — Toggle plugins without uninstalling
- **Auto-Discovery** — Registry indexes public GitHub plugins automatically

## Installation

```bash
npm install -g claude-plugins
```

Or use directly with `npx`:

```bash
npx claude-plugins install @EveryInc/every-marketplace/compounding-engineering
```

Plugins are installed to `~/.claude/plugins/marketplaces/`

## What are Claude Plugins?

Claude Plugins are custom collections of slash commands, agents, MCP servers, and hooks that can be installed with a single command. They extend Claude Code's functionality, allowing you to create custom shortcuts, install purpose-built agents, and connect to external tools through the Model Context Protocol.

> **Note:** Requires [Claude Code v2.0.12](https://x.com/claudeai/status/1976332881409737124) or later.

## Commands

| Command | Description |
|---------|-------------|
| `install <plugin>` | Install a plugin from the registry |
| `list` | View installed plugins (✓ enabled, ✗ disabled) |
| `enable <name>` | Enable a disabled plugin |
| `disable <name>` | Disable a plugin without uninstalling |

## Plugin Identifier Format

Plugins are identified using the format: `@owner/marketplace/plugin-name`

Examples:
- `@EveryInc/every-marketplace/compounding-engineering`
- `@anthropics/claude-code-plugins/pr-review-toolkit`

## Examples

```bash
# Install a plugin
claude-plugins install @EveryInc/every-marketplace/compounding-engineering

# List all installed plugins
claude-plugins list

# Disable a plugin temporarily
claude-plugins disable compounding-engineering

# Re-enable it later
claude-plugins enable compounding-engineering
```

## Development

### Run tests

```bash
bun test
```

### Build

```bash
bun run build
```

## License

MIT
