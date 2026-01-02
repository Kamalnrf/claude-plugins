# Claude Plugins

A plugin manager and skills installer for AI coding agents.

[![Claude Code Plugins](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fclaude-plugins.dev%2Fapi%2Fplugins%3Flimit%3D1&query=%24.total&label=Claude%20Code%20Plugins&color=blue)](https://claude-plugins.dev)
[![Agent Skills](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fclaude-plugins.dev%2Fapi%2Fskills%3Flimit%3D1&query=%24.total&label=Agent%20Skills&color=green)](https://claude-plugins.dev/skills)
[![claude-plugins](https://img.shields.io/npm/v/claude-plugins?label=claude-plugins)](https://www.npmjs.com/package/claude-plugins)
[![skills-installer](https://img.shields.io/npm/v/skills-installer?label=skills-installer)](https://www.npmjs.com/package/skills-installer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Quick Start

**Install a Claude plugin:**
```bash
npx claude-plugins install @EveryInc/every-marketplace/compounding-engineering
```

> [!IMPORTANT]
> Requires [Claude Code v2.0.12](https://x.com/claudeai/status/1976332881409737124) or later for plugin support.

**Install an agent skill (works with [agentskills](https://agentskills.io)-compatible clients):**
```bash
npx skills-installer install @anthropics/claude-code/frontend-design
```

> [!IMPORTANT]
> Check [agentskills](https://agentskills.io) to see if your client supports skills.

## Why Use This?

Discovering, installing, and managing plugins and skills across AI coding agents can be fragmented. This project provides:

- **One registry** for discovering 8,921 Claude Code plugins and 46,710 agent skills at [claude-plugins.dev](https://claude-plugins.dev)
- **Two focused CLIs** — `claude-plugins` for Claude Code plugins, `skills-installer` for agent skills
- **Multi-client support** — Install skills for Claude, Cursor, OpenCode, Codex, VS Code,  Amp Code, Goose, Letta.

## Discover

Explore available Claude Code plugins and agent skills at **[claude-plugins.dev](https://claude-plugins.dev)**

Our [registry](https://www.val.town/x/kamalnrf/claude-plugins-registry) automatically discovers and indexes all public Claude Code plugins and agent skills on GitHub.

## Two CLI Tools

This project provides two command-line tools:

### claude-plugins

Manage Claude Code plugins — install, enable, disable, and list.

```bash
npm install -g claude-plugins
```

| Command | Description |
|---------|-------------|
| `install <plugin>` | Install a plugin from the registry |
| `list` | View installed plugins |
| `enable <name>` | Enable a disabled plugin |
| `disable <name>` | Disable a plugin |

Plugins are installed to `~/.claude/plugins/marketplaces/`

### skills-installer

Install [Agent Skills](https://agentskills.io) across multiple AI coding clients.

```bash
npm install -g skills-installer
```

| Command | Description |
|---------|-------------|
| `install <skill>` | Install or update a skill |
| `list` | List installed skills |

**Options:**
- `--client <name>` — Target client (default: claude-code)
- `--local` or `-l` — Install to current directory only

Skills are installed to `~/.claude/skills/` (global) or `./.claude/skills/` (local)

### Supported Clients

| Client | Flag |
|--------|------|
| Claude Code | `--client claude-code` (default) |
| Cursor | `--client cursor` |
| VS Code | `--client vscode` |
| Codex | `--client codex` |
| Amp Code | `--client amp` |
| OpenCode | `--client opencode` |
| Goose | `--client goose` |
| Letta | `--client letta` |
| GitHub | `--client github` |

## How It Works

Both tools resolve identifiers via our [registry](https://www.val.town/x/kamalnrf/claude-plugins-registry):

1. Run install command with identifier (e.g., `@owner/repo/name`)
2. Registry returns the Git repository URL
3. CLI clones and installs the plugin or skill

## Star History

Found this project useful? A star helps others find it too!

[![Star History Chart](https://api.star-history.com/svg?repos=Kamalnrf/claude-plugins&type=Date)](https://star-history.com/#Kamalnrf/claude-plugins&Date)

## Development

See [CLI README](packages/cli/README.md) for development instructions.

**Tech stack:**
- [Bun](https://bun.sh) for CLI
- [Val Town](https://val.town) for registry API
- [Astro](https://astro.build) for web app

## Contributing

Contributions welcome! Open an issue or submit a PR.

## License

MIT