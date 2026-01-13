import type { APIRoute } from 'astro';
import { ImageResponse } from '@vercel/og';

export const GET: APIRoute = async () => {
  const html = {
    type: 'div',
    key: 'og-image',
    props: {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#252321',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            },
            children: [
              {
                type: 'h1',
                props: {
                  style: {
                    fontSize: '80px',
                    fontWeight: 'bold',
                    color: '#fb923c',
                    margin: '0',
                    marginBottom: '20px',
                    fontFamily: 'Georgia, serif',
                    letterSpacing: '-0.02em',
                  },
                  children: 'Agent Skills',
                },
              },
              {
                type: 'p',
                props: {
                  style: {
                    fontSize: '32px',
                    color: '#a8b3c7',
                    margin: '0',
                    marginBottom: '20px',
                    fontFamily: 'system-ui, sans-serif',
                  },
                  children: 'Agent Skills for AI Coding Agents',
                },
              },
              {
                type: 'p',
                props: {
                  style: {
                    fontSize: '24px',
                    color: '#a8b3c7',
                    margin: '0',
                    marginBottom: '40px',
                    fontFamily: 'system-ui, sans-serif',
                  },
                  children: 'Works with Claude, Cursor, OpenCode, Codex & more',
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#2d2b28',
                    border: '2px solid #393734',
                    borderRadius: '12px',
                    padding: '24px 48px',
                    marginBottom: '60px',
                  },
                  children: {
                    type: 'code',
                    props: {
                      style: {
                        fontSize: '28px',
                        color: '#fb923c',
                        fontFamily: 'Menlo, Monaco, monospace',
                      },
                      children: 'npx skills-installer install',
                    },
                  },
                },
              },
              {
                type: 'p',
                props: {
                  style: {
                    fontSize: '24px',
                    color: '#6B7280',
                    margin: '0',
                    fontFamily: 'system-ui, sans-serif',
                  },
                  children: 'claude-plugins.dev',
                },
              },
            ],
          },
        },
      ],
    },
  };

  return new ImageResponse(html, {
    width: 1200,
    height: 630,
    headers: {
      // Cache for 24 hours with 48 hour stale-while-revalidate
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
    },
  });
};

