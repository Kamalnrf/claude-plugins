export interface PluginSource {
  source: "url" | "directory" | "git";
  url?: string;
  path?: string;
}

export interface Plugin {
  name: string;
  source: PluginSource;
  description: string;
  version: string;
  author: { name: string; url?: string; email?: string };
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
  category?: string;
  strict?: boolean;
  commands?: string[];
  agents?: string[];
  mcpServers?: string[];
}

export interface Marketplace {
  name: string;
  owner: { name: string; url: string };
  metadata: { description: string; version: string };
  plugins: Plugin[];
}

export interface KnownMarketplace {
  source: PluginSource;
  installLocation: string;
  lastUpdated: string;
}

export interface Settings {
  enabledPlugins: Record<string, boolean>;
  hooks?: Record<string, unknown>;
  alwaysThinkingEnabled?: boolean;
}

export interface Config {
  defaultMarketplace: string;
  registryUrl?: string;
}
