import type { APIRoute } from 'astro';
import { ImageResponse } from '@vercel/og';

export const GET: APIRoute = async () => {
  const html = {
    type: 'div',
    props: {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        backgroundImage: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(247, 147, 30, 0.1) 100%)',
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
                    fontSize: '72px',
                    fontWeight: 'bold',
                    color: '#fff',
                    margin: '0',
                    marginBottom: '20px',
                  },
                  children: 'Claude Code Plugins',
                },
              },
              {
                type: 'p',
                props: {
                  style: {
                    fontSize: '32px',
                    color: '#999',
                    margin: '0',
                    marginBottom: '40px',
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
                    backgroundColor: '#1a1a1a',
                    border: '2px solid #333',
                    borderRadius: '12px',
                    padding: '24px 48px',
                    marginBottom: '60px',
                  },
                  children: {
                    type: 'code',
                    props: {
                      style: {
                        fontSize: '28px',
                        color: '#00ff88',
                        fontFamily: 'monospace',
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
                    color: '#666',
                    margin: '0',
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
