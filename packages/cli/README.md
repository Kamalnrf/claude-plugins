# Claude Plugins CLI

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
