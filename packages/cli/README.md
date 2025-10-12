# Claude Plugins CLI

CLI tool for managing Claude Code plugins with an npm-like workflow.

## Installation

```bash
cd packages/cli
bun install
chmod +x src/index.ts
```

## Usage

### Install a plugin

Install plugins using @namespace/name format, namespace/name format, or direct URLs:

```bash
# From hardcoded registry
bun run src/index.ts install @wshobson/claude-code-essentials

# From GitHub (namespace/repo format)
bun run src/index.ts install davila7/claude-code-templates

# From direct URL
bun run src/index.ts install https://github.com/org/plugin.git
```

### Search for plugins

Search the marketplace for available plugins:

```bash
# List all plugins
bun run src/index.ts search

# Filter by query (searches name, description, keywords)
bun run src/index.ts search supabase
```

### List installed plugins

View all installed plugins grouped by marketplace:

```bash
bun run src/index.ts list
```

Output shows enabled (✓) and disabled (✗) plugins.

### Remove a plugin

Remove an installed plugin:

```bash
bun run src/index.ts remove plugin-name
```

This will:
- Remove from settings.json
- Remove from marketplace.json
- Delete cached files

## Architecture

### Directory Structure

```
~/.claude/
   settings.json                    # Plugin enablement settings
   plugins/
      config.json                   # CLI configuration
      known_marketplaces.json       # Registered marketplaces
      marketplaces/
         marketplace-name/          # Marketplace repos
             .claude-plugin/
                 marketplace.json   # Plugin registry
      cache/
          plugin-name/              # Cloned plugin repos
```

### Key Features

- **File Locking**: Prevents race conditions during concurrent operations
- **Validation**: Ensures plugins have required `.claude-plugin` directory structure
- **Rollback**: Automatically rolls back failed installations
- **Metadata Extraction**: Reads plugin info from cloned repos
- **Configuration**: Flexible marketplace and registry settings

## Development

### Run tests

```bash
bun test
```

### Build

```bash
bun run build
```

## Plugin Resolution

The CLI resolves plugin identifiers to git URLs:

1. **@namespace/plugin** → Hardcoded registry lookup (MVP)
2. **namespace/plugin** → `https://github.com/namespace/plugin.git`
3. **https://...** → Direct URL

Future versions will use API-based resolution.

## Creating Plugins

A valid Claude plugin must have:

```
your-plugin/
  .claude-plugin/
    marketplace.json (or plugin.json)
  agents/          (optional)
  commands/        (optional)
  mcpServers/      (optional)
```

Minimum `marketplace.json`:

```json
{
  "name": "your-plugin",
  "description": "Plugin description",
  "version": "1.0.0",
  "author": {
    "name": "Your Name"
  }
}
```

## Configuration

The CLI stores configuration in `~/.claude/plugins/config.json`:

```json
{
  "defaultMarketplace": "claude-plugin-marketplace",
  "registryUrl": "https://api.claude-plugins.com"
}
```

## Troubleshooting

### Plugin installation fails

1. Check network connectivity
2. Verify the plugin URL is accessible
3. Ensure the plugin has `.claude-plugin` directory
4. Check console for specific error messages

### Concurrent installation issues

The CLI uses file locking to prevent corruption. If you see stuck installations, restart the process.

### Marketplace not found

Run an install command first - this will bootstrap the default marketplace.

## Future Enhancements

- API-based plugin resolution
- Plugin update/upgrade command
- Enable/disable without removing
- Plugin dependency resolution
- Version pinning
- Interactive install mode
- Plugin signatures/verification

## Documentation

- [Complete Specification](../../spec.md)
- [Bun Documentation](https://bun.sh/docs)
- [@clack/prompts](https://github.com/natemoo-re/clack)
