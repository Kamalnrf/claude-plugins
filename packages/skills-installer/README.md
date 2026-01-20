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

Search across all public skills on GitHub:

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

### Install skills

The install command supports multiple formats:

```bash
# Browse all skills from an owner
skills-installer install anthropics

# Browse skills in a specific repo
skills-installer install anthropics/claude-code

# Install a specific skill
skills-installer install anthropics/claude-code/frontend-design

# Install from any GitHub URL
skills-installer install https://github.com/owner/repo/tree/main/skills/my-skill
```

### Install to project directory

```bash
skills-installer install anthropics/claude-code/pdf --project
# or
skills-installer install anthropics/claude-code/pdf -p
```

Project skills are only available in the current project directory.

### Update an existing skill

Simply run the install command again - it will automatically update:

```bash
skills-installer install anthropics/claude-code/frontend-design
```

### List installed skills

```bash
skills-installer list
```

Shows all installed skills with their installation scope (global/project) and paths.

### Target specific clients

```bash
skills-installer install @anthropics/skills/xlsx --client cursor
```

Currently supported clients:
- `claude-code` (default)
- `amp`
- `codex`
- `cursor`
- `windsurf`
- `github`
- `vscode`
- `gemini`
- `goose`
- `letta`
- `opencode`
- `antigravity`
- `trae`
- `qoder`
- `codebuddy`

## Commands

| Command | Description |
|---------|-------------|
| `search [query]` | Search across all public skills on GitHub |
| `install owner` | Browse all skills from owner's repos |
| `install owner/repo` | Browse skills in a specific repo |
| `install owner/repo/skill` | Install a specific skill |
| `install <git-url>` | Install from HTTPS, SSH, or direct path |
| `list` | List all installed skills |

## Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--client <name>` | | Target AI coding client (default: claude-code) |
| `--project` | `-p` | Install to current project directory |

## Skill Identifier Format

Skills can be identified using multiple formats:

- `owner` - Browse all skills from owner's repositories
- `owner/repo` - Browse skills in a specific repository
- `owner/repo/skill` - Install a specific skill
- `https://github.com/owner/repo/tree/main/skills/skill-name` - Direct GitHub URL

## Where are skills installed?

**Global installation (claude-code):**
- `~/.claude/skills/`

**Project installation:**
- `./.claude/skills/` (in your current directory)

## Examples

```bash
# Search for skills interactively
skills-installer search

# Search with a specific query
skills-installer search "frontend design"

# Browse all skills from an owner
skills-installer install anthropics

# Browse skills in a specific repo
skills-installer install anthropics/claude-code

# Install a specific skill globally
skills-installer install anthropics/claude-code/frontend-design

# Install a skill to current project
skills-installer install anthropics/claude-code/frontend-design --project

# Install from a GitHub URL
skills-installer install https://github.com/owner/repo/tree/main/skills/my-skill

# Install skill for a specific client
skills-installer install anthropics/claude-code/frontend-design --client cursor

# List all installed skills
skills-installer list
```

## License

MIT
