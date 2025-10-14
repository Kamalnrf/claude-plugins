import { useState, useEffect, useDeferredValue } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import InfinitePluginList from './InfinitePluginList';
import type { Plugin } from '@/lib/api';

interface PluginBrowserProps {
  initialPlugins: Plugin[];
  initialQuery: string;
  total: number;
}

// Format number helper
function formatNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 10000) return num.toLocaleString('en-US');
  if (num < 1000000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
}

export default function PluginBrowser({ initialPlugins, initialQuery, total: initialTotal }: PluginBrowserProps) {
  const [{plugins, total}, setPlugins] = useState({
    plugins: initialPlugins,
    total: initialTotal
  });

  // Search query from URL
  const getSearchQuery = () => {
    if (typeof window === 'undefined') return initialQuery;
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  };

  const [searchQuery, setSearchQuery] = useState(getSearchQuery());
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Fetch results when deferred query changes
  useEffect(() => {
    const fetchPlugins = async () => {
      try {
        const params = new URLSearchParams({
          q: deferredSearchQuery,
          limit: '20',
          offset: '0',
        });

        const response = await fetch(`/api/plugins?${params}`);
        const data = await response.json();

        setPlugins({
          plugins: data.plugins || [],
          total: data.total || 0
        });
      } catch (error) {
        console.error('Failed to fetch plugins:', error);
      }
    };

    fetchPlugins();
  }, [deferredSearchQuery]);

  const handleInputChange = (value: string) => {
    // Update URL immediately
    if (value === '') {
      const url = new URL(window.location.href);
      url.searchParams.delete('q');
      window.history.pushState({}, '', url.toString());
    } else {
      const url = new URL(window.location.href);
      url.searchParams.set('q', value);
      window.history.pushState({}, '', url.toString());
    }

    setSearchQuery(value);
  };

  const handleBadgeClick = (keyword: string) => {
    handleInputChange(keyword);
  };

  return (
    <>
      <section className="flex flex-col gap-3 sticky top-0 z-10 backdrop-blur-md bg-background/80 pt-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-foreground/90 tracking-tight">Browse Plugins</h2>
          <div className="flex-1 h-px bg-border/30"></div>
          <div className="text-xs font-medium text-muted-foreground/70 tabular-nums px-2.5 py-1 bg-muted/30 rounded-full border border-border/30">
            {formatNumber(total)} {total === 1 ? 'plugin' : 'plugins'}
          </div>
        </div>
        <form onSubmit={(e) => e.preventDefault()} aria-label="Search plugins">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              name="q"
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Search by name, author, or keyword..."
              aria-label="Search for Claude Code plugins"
              className="h-9 pl-9 text-sm bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
        </form>
      </section>
      <InfinitePluginList
        initialPlugins={plugins}
        total={total}
        searchQuery={searchQuery}
        onSearchChange={handleBadgeClick}
      />
    </>
  );
}
