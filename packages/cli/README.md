# Claude Plugins CLI

Manage *ALL* Claude Code plugins in one place.

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

The plugin files remain intact and can be re-enabled later.

## How It Works

It works same as installing with Claude Code. Main difference being instead of running multiple commands, to add marketplace, and for installing plugin. This tool, will do it in one command. The plugin manager uses a centralized registry to resolve plugin identifiers to Git repositories:

1. You run `npx claude-plugins install @namespace/name`
2. CLI queries the registry API
3. Registry returns the Git URL
4. CLI clones and validates the plugin
5. Plugin is enabled in Claude Code

Plugins are installed to `~/.claude/plugins/marketplaces/`

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

1. **@author/marketplace/plugin** → API lookup at `https://api.claude-plugins.dev/api/resolve/author/marketplace/plugin`
2. **namespace/plugin** → API lookup at `https://api.claude-plugins.dev/api/resolve/namespace/plugin`
3. **plugin** → API lookup at `https://api.claude-plugins.dev/api/resolve/plugin`

All plugins must be registered in the central registry. The API automatically tracks download statistics. C

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
