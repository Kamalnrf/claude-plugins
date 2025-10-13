# Claude Plugins CLI

Manage _ALL_ Claude Code plugins in one place.

> You must be on atleast [Claude Code v2.0.12](https://x.com/claudeai/status/1976332881409737124) to be able to use the Claude Plugins CLI

## Discover Plugins

Explore available plugins at **[claude-plugins.dev](https://claude-plugins.dev)**
Today we are sourcing all public plugins on Github and indexing them for easy discovery and installation.

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

## How It Works

It works same as installing with Claude Code. Main difference being instead of running multiple commands, to add marketplace, and for installing plugin. This tool, will do it in one command. The plugin manager uses a centralized registry to resolve plugin identifiers to Git repositories:

1. You run `npx claude-plugins install @namespace/name`
2. CLI queries the registry API
3. Registry returns the Git URL
4. CLI clones and validates the plugin
5. Plugin is enabled in Claude Code

Plugins are installed to `~/.claude/plugins/marketplaces/`

## Architecture

This repository contains:

- **CLI** (`packages/cli`) - Command-line tool for managing plugins
- **Registry API** - Central plugin registry on Val Town
- **Web** (`packages/web`) - Plugin discovery website

**Registry API:** [val.town/x/kamalnrf/claude-plugins-registry](https://www.val.town/x/kamalnrf/claude-plugins-registry)

## Development

See [CLI README](packages/cli/README.md) for development instructions.

## Contributing

Contributions welcome! This project uses:

- Bun for the CLI
- Val Town for the API
- Astro for Web App

## License

MIT
