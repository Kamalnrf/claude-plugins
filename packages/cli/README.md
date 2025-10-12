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

Install plugins using npm-style package names (all plugins must be registered in the central registry):

```bash
# Scoped plugins with @ prefix
bun run src/index.ts install @every/compounding-engineering
bun run src/index.ts install @wshobson/claude-code-essentials

# Scoped plugins without @ prefix
bun run src/index.ts install every/compounding-engineering

# Unscoped plugins
bun run src/index.ts install plugin-name
```

**Note:** All plugins must be registered in the central registry API. Direct URLs are not supported.

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

### Enable a plugin

Re-enable a previously disabled plugin:

```bash
bun run src/index.ts enable plugin-name
```

This command works for both local and external marketplace plugins that have been disabled.

### Disable a plugin

Disable an installed plugin:

```bash
bun run src/index.ts disable plugin-name
```

This will:
- **For external marketplace plugins**: Disables the plugin (sets to `false` in settings.json) but keeps all files
- **For local marketplace plugins**: Disables the plugin AND removes files from the local marketplace directory
  - If it's the last plugin in the local marketplace, the entire local marketplace is removed

## Architecture

### Directory Structure

```
~/.claude/
   settings.json                         # Plugin enablement settings
   plugins/
      config.json                        # CLI configuration
      known_marketplaces.json            # Registered marketplaces
      marketplaces/
         claude-plugin-marketplace/      # Default local marketplace
             .claude-plugin/
                 marketplace.json        # Local plugin registry
             plugin-1/                   # Individual plugin (cloned)
             plugin-2/                   # Another individual plugin
         compounding-engineering/        # Installed marketplace (cloned)
             .claude-plugin/
                 marketplace.json        # Marketplace's plugin registry
```

**Architecture:**
- **Marketplaces** are cloned to `marketplaces/marketplace-name/` and registered in `known_marketplaces.json`
- **Individual plugins** are cloned to `marketplaces/local-marketplace/plugin-name/`
- Claude scans all marketplaces in `marketplaces/` to discover plugins
- The CLI automatically detects if you're installing a marketplace or a plugin

### Installation Flow

When you run `install @namespace/name`:

1. **Resolve URL** - Query registry API or use fallback
2. **Clone to temp** - Clone to temporary location
3. **Validate** - Check for `.claude-plugin/` directory
4. **Detect type** - Check if marketplace (has `plugins` array) or individual plugin
5. **Install accordingly**:
   - **Marketplace**: Move to `marketplaces/name/`, register in `known_marketplaces.json`
   - **Plugin**: Move to `marketplaces/local/name/`, add to local marketplace, enable in settings

### Key Features

- **File Locking**: Prevents race conditions during concurrent operations
- **Type Detection**: Automatically distinguishes marketplaces from plugins
- **Validation**: Ensures `.claude-plugin` directory structure
- **Rollback**: Automatically cleans up failed installations
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

The CLI resolves all plugin identifiers via the central registry API (npm-style):

1. **@namespace/plugin** → API lookup at `https://kamalnrf--44867e10a75311f08f880224a6c84d84.web.val.run/api/resolve/namespace/plugin`
2. **namespace/plugin** → API lookup at `https://kamalnrf--44867e10a75311f08f880224a6c84d84.web.val.run/api/resolve/namespace/plugin`
3. **plugin** → API lookup at `https://kamalnrf--44867e10a75311f08f880224a6c84d84.web.val.run/api/resolve/plugin`

All plugins must be registered in the central registry. The API automatically tracks download statistics.

**Registry API:** https://www.val.town/x/kamalnrf/claude-plugins-registry

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
  "registryUrl": "https://kamalnrf--44867e10a75311f08f880224a6c84d84.web.val.run"
}
```

The registry URL points to the central Claude Plugins API deployed on Val Town.

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

- Plugin update/upgrade command
- Plugin dependency resolution
- Version pinning
- Interactive install mode
- Plugin signatures/verification
- Search command with API integration

## Documentation

- [Complete Specification](../../spec.md)
- [Bun Documentation](https://bun.sh/docs)
- [@clack/prompts](https://github.com/natemoo-re/clack)
