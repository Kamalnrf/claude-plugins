# Claude Plugins CLI

Manage Claude Code plugins with a simple command-line interface.

## Usage

No installation required - use with `npx` or `bunx`:

```bash
# Install a plugin
npx claude-plugins install @every/compounding-engineering
bunx claude-plugins install @every/compounding-engineering

# List installed plugins
npx claude-plugins list

# Enable/disable plugins
npx claude-plugins enable plugin-name
npx claude-plugins disable plugin-name
```

Or install globally:

```bash
npm install -g claude-plugins
```

## Discover Plugins

Explore available plugins at **[claude-plugins.dev](https://claude-plugins.dev)**

## Commands

### `install <plugin-identifier>`

Install a plugin from the registry:

```bash
# Scoped plugins
npx claude-plugins install @every/compounding-engineering
npx claude-plugins install @wshobson/claude-code-essentials

# Scoped without @ prefix
npx claude-plugins install every/compounding-engineering

# Unscoped plugins
npx claude-plugins install plugin-name
```

All plugins must be registered in the central registry.

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

Disable an installed plugin without removing it:

```bash
npx claude-plugins disable plugin-name
```

The plugin files remain intact and can be re-enabled later.

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

1. **@namespace/plugin** → API lookup at `https://api.claude-plugins.dev/api/resolve/namespace/plugin`
2. **namespace/plugin** → API lookup at `https://api.claude-plugins.dev/api/resolve/namespace/plugin`
3. **plugin** → API lookup at `https://api.claude-plugins.dev/api/resolve/plugin`

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

## Future Enhancements

- Search command with API integration (API endpoint exists, CLI command not implemented yet)
- Plugin update/upgrade command
- Version pinning
- Plugin signatures/verification
