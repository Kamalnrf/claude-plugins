# Claude Plugins CLI

Manage _ALL_ Claude Code plugins in one place.

> You must be on at least [Claude Code v2.0.12](https://x.com/claudeai/status/1976332881409737124) to be able to use the Claude Plugins CLI

## Discover Plugins

Explore available plugins and skills at **[claude-plugins.dev](https://claude-plugins.dev)**

Currently indexing **1200+ plugins** from GitHub repositories. Our [registry](https://www.val.town/x/kamalnrf/claude-plugins-registry) automatically discovers and indexes all public Claude Code plugins on GitHub every 10 minutes for easy discovery and installation.

## Usage

With `npx`:

```bash
# Install a plugin
npx claude-plugins install @anthropics/claude-code-plugins/pr-review-toolkit

# List installed plugins
npx claude-plugins list

# Enable/disable plugins
npx claude-plugins enable plugin-name
npx claude-plugins disable plugin-name
```

Or globally:

```bash
npm install -g claude-plugins
```

![usage-demo](https://github.com/user-attachments/assets/45598f81-1718-4c5b-9824-37e4f297fc61)

## Commands

### `install <plugin-identifier>`

Install a plugin from the registry:

All plugins must be registered @ central registry. Currently we scour Github for public plugins.

### `list`

View all installed plugins grouped by marketplace:

```bash
npx claude-plugins list
```

Output shows enabled (✓) and disabled (✗) plugins.

### `enable <plugin-name>`

Re-enable a previously disabled plugin:

```bash
npx claude-plugins enable plugin-name
```

### `disable <plugin-name>`

Disable an installed plugin:

```bash
npx claude-plugins disable plugin-name
```

The plugin can be re-enabled later.

## Plugin Resolution

The CLI resolves all plugin identifiers via a [lightweight registry](https://www.val.town/x/kamalnrf/claude-plugins-registry)(npm-style):

1. **@author/marketplace/plugin** → API lookup at `https://api.claude-plugins.dev/api/resolve/author/marketplace/plugin`
2. **namespace/plugin** → API lookup at `https://api.claude-plugins.dev/api/resolve/namespace/plugin`
3. **plugin** → API lookup at `https://api.claude-plugins.dev/api/resolve/plugin`

Today, we are [indexing all publicly available plugins](https://www.val.town/x/kamalnrf/claude-plugins-registry) on Github every 10 mins, so no additional changes required to get your plugin added. And every public plugin is available for easy installation.

## How It Works

The plugin manager uses a centralized registry to resolve plugin identifiers to Git repositories:

1. You run `npx claude-plugins install @namespace/name`
2. CLI queries the registry API
3. Registry returns the Git URL
4. CLI clones and validates the plugin
5. Plugin is enabled in Claude Code

Plugins are installed to `~/.claude/plugins/marketplaces/`

## Architecture

This repository contains:

- **CLI** (`packages/cli`) - Command-line tool for managing plugins
- **Registry API** - Central plugin registry on Val Town that auto-indexes GitHub
- **Web** (`packages/web`) - Plugin discovery website with skills filtering

**Registry API:** [val.town/x/kamalnrf/claude-plugins-registry](https://www.val.town/x/kamalnrf/claude-plugins-registry)

### Skills Support

Many plugins now include [Claude Skills](https://docs.claude.com/en/docs/claude-code/skills) - reusable capabilities that extend Claude Code's functionality. Browse and filter plugins by skills on [claude-plugins.dev](https://claude-plugins.dev).

## Roadmap

- [ ] Search command with API integration (API endpoint exists, CLI command not implemented yet)
- [ ] Plugin update/upgrade command
- [ ] Version pinning
- [ ] Plugin signatures/verification
- [ ] Plugin interoperability between different coding agents (e.g., Claude Code, Gemini CLI, Codex)
- [ ] Plugin owners being able to update the plugin identifier

## Development

See [CLI README](packages/cli/README.md) for development instructions.

## Contributing

Contributions welcome! This project uses:

- Bun for the CLI
- Val Town for the API
- Astro for Web App

## License

MIT
