# Claude Plugins Marketplace

Web App for discovering plugins, browsing skills, and finding instructions on how to use `claude-plugins`.

## Features

- **Plugin Browser**: Discover and search 1200+ Claude Code plugins
- **Skills Discovery**: Dedicated skills browser with filtering and search
- **Skill Detail Pages**: View individual skill documentation with markdown rendering
- **Install Instructions**: Quick-start copy-paste commands for easy installation
- **Tab Navigation**: Switch seamlessly between plugins and skills
- **Real-time Search**: Client-side search with URL parameter support
- **Infinite Scroll**: Smooth pagination for browsing large collections
- **Auto-indexed Content**: Automatically indexes GitHub repositories every 10 minutes

## Tech Stack

- **Astro**: Static site generation with island architecture
- **React**: Interactive UI components
- **Tailwind CSS**: Styling with shadcn/ui components
- **Motion**: Smooth animations and transitions
- **Lucide Icons**: Icon library
- **Marked**: Markdown rendering for skill documentation
- **DOMPurify**: Secure HTML sanitization

## Components

### New Skills Components
- `SkillBrowser`: Main skills browsing interface with search
- `SkillCard`: Individual skill card display
- `SkillDetailHeader`: Detailed skill information header
- `InfiniteSkillList`: Infinite scrolling skill list
- `InstallSkill`: Installation instructions for skills
- `PluginOrSkillsTabSwitcher`: Navigation between plugins and skills

### Shared UI Components
- `Markdown.astro`: Markdown rendering component
- `ui/breadcrumb.tsx`: Navigation breadcrumbs
- `ui/tabs.tsx`: Tab switching component
- `ui/claude-icons.tsx`: Claude-specific icon set

## Routes

- `/` - Plugin browser (home page)
- `/skills` - Skills discovery page
- `/skills/[slug]` - Individual skill detail page
- `/api/skills` - Skills search API endpoint

## Shoutout

Design is inspired by [pqoqubbw/icons](https://icons.pqoqubbw.dev/), and also using the library for icons!
