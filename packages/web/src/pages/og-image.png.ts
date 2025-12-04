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
                  children: 'Claude Code Plugins',
                },
              },
              {
                type: 'p',
                props: {
                  style: {
                    fontSize: '32px',
                    color: '#a8b3c7',
                    margin: '0',
                    marginBottom: '40px',
                    fontFamily: 'system-ui, sans-serif',
                  },
                  children: 'Install plugins with one command',
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#2d2b28', // Using card color from design system
                    border: '2px solid #393734', // Using border color from design system
                    borderRadius: '12px',
                    padding: '24px 48px',
                    marginBottom: '60px',
                  },
                  children: {
                    type: 'code',
                    props: {
                      style: {
                        fontSize: '28px',
                        color: '#fb923c', // Using orange-400 to match brand gradient
                        fontFamily: 'Menlo, Monaco, monospace',
                      },
                      children: 'npx claude-plugins install',
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
  });
};
