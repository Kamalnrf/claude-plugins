# skills-installer

A CLI tool to install and manage agent skills that comply with the [agentskills spec](https://agentskills.io) across multiple AI coding clients.
Browse and discover available skills at [claude-plugins.dev/skills](https://claude-plugins.dev/skills).

## Features

- 🔍 **Interactive Search** - Discover and install skills interactively
- 🚀 **Simple CLI** - Clean, intuitive command-line interface
- 📦 **Universal Registry** - Access skills all public agent skills
- 🌍 **Global & Local** - Install skills globally or per-project
- 🎯 **Multi-Client Support** - Install skills for different coding clients

## Installation

```bash
npm install -g skills-installer
```

Or use directly with `npx`:

```bash
npx skills-installer install @anthropics/skills/frontend-design
```

## What are Agent Skills?

Agent Skills are specialized capabilities that extend AI coding assistants like Claude Code. Each skill follows the [agentskills specification](https://agentskills.io) - a standard format for defining AI agent capabilities through markdown files with structured instructions.


## Usage

### Search for skills

<p align="center">
  <img src="https://github.com/user-attachments/assets/b20597ad-7bed-4845-9fd4-2dd7da0b26d6" alt="Finding and exploring skills using the CLI" width="60%" />
</p>

Search the registry interactively:

```bash
skills-installer search
```

Search with a specific query:

```bash
skills-installer search "frontend design"
```

The search command provides an interactive interface where you can:
- Browse and sort skills ranked by relevance, installs, and GitHub stars
- Select a skill to install directly
- Choose installation scope and target client

### Install a skill globally

```bash
skills-installer install @anthropics/skills/frontend-design
```

Skills installed globally are available across all projects using the selected client.

### Install a skill locally

```bash
skills-installer install @anthropics/skills/pdf --local
```

Local skills are only available in the current project directory.

### Update an existing skill

Simply run the install command again - it will automatically update:

```bash
skills-installer install @anthropics/skills/frontend-design
```

### List installed skills

```bash
skills-installer list
```

Shows all installed skills with their installation scope (global/local) and paths.

### Target specific clients

```bash
skills-installer install @anthropics/skills/xlsx --client claude-code
```

Currently supported clients:
- `claude-code` (default)
- `codex`
- `cursor`
- `github`
- `letta`
- `vscode`
- `amp`
- `goose`
- `opencode`
- `gemini`

## Commands

| Command | Description |
|---------|-------------|
| `search [query]` | Search for skills in the registry |
| `install <skill>` | Install or update an agent skill |
| `list` | List all installed skills |
| `help` | Show help message |

## Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--client <name>` | | Target AI coding client (default: claude-code) |
| `--local` | `-l` | Install to current directory instead of globally |

## Skill Identifier Format

Skills are identified using the format: `@owner/repo/skill-name`

Examples:
- `@anthropics/skills/frontend-design`
- `@anthropics/skills/pdf`
- `@anthropics/skills/xlsx`

## Where are skills installed?

**Global installation (claude-code):**
- `~/.claude/skills/`

**Local installation:**
- `./.claude/skills/` (in your current directory)

## Examples

```bash
# Search for skills interactively
skills-installer search

# Search with a specific query
skills-installer search "frontend design"

# Search and install to specific client
skills-installer search "testing" --client cursor

# Install the frontend-design skill globally
skills-installer install @anthropics/claude-code/frontend-design

# Install a skill locally for current project
skills-installer install @anthropics/claude-code/frontend-design --local

# List all installed skills
skills-installer list

# Update an existing skill to latest version
skills-installer install @anthropics/claude-code/frontend-design

# Install skill for a specific client
skills-installer install @anthropics/claude-code/frontend-design --client vscode
```

## License

MIT
