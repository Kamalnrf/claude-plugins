# Claude Plugins

A plugin manager and skills installer for AI coding agents.

[![Claude Code Plugins](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fclaude-plugins.dev%2Fapi%2Fplugins%3Flimit%3D1&query=%24.total&label=Claude%20Code%20Plugins&color=blue)](https://claude-plugins.dev)
[![Agent Skills](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fclaude-plugins.dev%2Fapi%2Fskills%3Flimit%3D1&query=%24.total&label=Agent%20Skills&color=green)](https://claude-plugins.dev/skills)
[![claude-plugins](https://img.shields.io/npm/v/claude-plugins?label=claude-plugins)](https://www.npmjs.com/package/claude-plugins)
[![skills-installer](https://img.shields.io/npm/v/skills-installer?label=skills-installer)](https://www.npmjs.com/package/skills-installer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Discord](https://img.shields.io/discord/1320743242672635965?label=Discord&logo=discord&logoColor=white&color=5865F2)](https://discord.gg/Pt9uN4FXR4)

<div align="center">
  <video src="https://github.com/user-attachments/assets/63582572-397d-4104-8efe-ab844a0f43f0" />
</div>

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

- **One registry** for discovering 10,620 Claude Code plugins and 52,909 agent skills at [claude-plugins.dev](https://claude-plugins.dev)
- **Two focused CLIs** — `claude-plugins` for Claude Code plugins, `skills-installer` for agent skills
- **Multi-client support** — Install skills for Claude, Cursor, Windsurf, OpenCode, Codex, VS Code, Amp Code, Goose, Letta, Gemini CLI, Antigravity.
- **Autonomous discovery** — Install the [skills-discovery](#autonomous-skill-discovery) meta skill and let your agent find and install skills for you

## Discover

Explore available Claude Code plugins and agent skills at **[claude-plugins.dev](https://claude-plugins.dev)** or use `skills-installer search` from your terminal.

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
| `search [query]` | Search for skills in the registry |
| `install <skill>` | Install or update a skill |
| `list` | List installed skills |

**Options:**
- `--client <name>` — Target client (default: claude-code)
- `--local` or `-l` — Install to current directory only

Skills are installed to `~/.claude/skills/` (global) or `./.claude/skills/` (local)

#### Interactive Search
<p align="center">
  <img src="https://github.com/user-attachments/assets/b20597ad-7bed-4845-9fd4-2dd7da0b26d6" alt="Finding and exploring skills using the CLI" width="60%" />
</p>

The `search` command provides an interactive terminal experience for discovering skills — search, browse, sort by relevance/stars/installs, and install without leaving your terminal.

```bash
npx skills-installer search
```

### Supported Clients

| Client | Flag |
|--------|------|
| Claude Code | `--client claude-code` (default) |
| Cursor | `--client cursor` |
| Windsurf | `--client windsurf` |
| VS Code | `--client vscode` |
| Codex | `--client codex` |
| Amp Code | `--client amp` |
| OpenCode | `--client opencode` |
| Goose | `--client goose` |
| Letta | `--client letta` |
| GitHub | `--client github` |
| Gemini CLI | `--client gemini` |
| Antigravity | `--client antigravity` |

### How It Works

Both tools resolve identifiers via our [registry](https://www.val.town/x/kamalnrf/claude-plugins-registry):

1. Run install command with identifier (e.g., `@owner/repo/name`)
2. Registry returns the Git repository URL
3. CLI clones and installs the plugin or skill

## Autonomous Skill Discovery

Want your agent to help you discover and install skills? Try the **skills-discovery** meta skill:

```bash
npx skills-installer install @Kamalnrf/claude-plugins/skills-discovery
```

Once installed, your agent will:
- Proactively search for relevant skills before starting tasks
- Help you compare and understand the differences between skills
- Install skills on your behalf with your confirmation

## Support the Project

If you find this project useful, here are two ways to help:

### Star the Repository

A star helps others discover this project!

<p align="center">
  <a href="https://star-history.com/#Kamalnrf/claude-plugins&Date">
    <img src="https://api.star-history.com/svg?repos=Kamalnrf/claude-plugins&type=Date" alt="Star History Chart" width="60%" />
  </a>
</p>

### Join our GitHub Token Pool

As the registry grows, we're approaching GitHub API rate limits (5,000 requests/hour). You can help by sharing a token:

1. Authorize our [OAuth Application](https://kamalnrf--2a4f92a4e90511f0934e42dde27851f2.web.val.run/)
2. This grants **read-only access to public data only** — no access to private repos or actions on your behalf
3. Your token joins a pool we rotate through to distribute API load

You can revoke access anytime at [github.com/settings/applications](https://github.com/settings/applications).

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
