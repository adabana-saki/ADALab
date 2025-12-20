import { ImageResponse } from '@vercel/og';

// フォントをキャッシュ
let cachedFont: ArrayBuffer | null = null;

const FONT_URL =
  'https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/Japanese/NotoSansCJKjp-Bold.otf';

async function loadFont(): Promise<ArrayBuffer> {
  if (cachedFont) return cachedFont;

  const response = await fetch(FONT_URL);
  if (!response.ok) {
    throw new Error(`Failed to load font: ${response.status}`);
  }
  cachedFont = await response.arrayBuffer();
  return cachedFont;
}

export const onRequestGet: PagesFunction = async (context) => {
  const { request } = context;
  const url = new URL(request.url);

  const rawTitle = url.searchParams.get('title') || 'ADA Lab';
  const title = rawTitle.length > 80 ? rawTitle.slice(0, 77) + '...' : rawTitle;
  const category = url.searchParams.get('category') || '';

  try {
    const fontData = await loadFont();

    return new ImageResponse(
      {
        type: 'div',
        props: {
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background:
              'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
            position: 'relative',
          },
          children: [
            // メインコンテンツ
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '60px 80px',
                },
                children: [
                  // カテゴリーバッジ
                  category
                    ? {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            padding: '8px 24px',
                            background:
                              'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                            borderRadius: '50px',
                            marginBottom: '24px',
                          },
                          children: {
                            type: 'span',
                            props: {
                              style: {
                                color: 'white',
                                fontSize: '24px',
                              },
                              children: category,
                            },
                          },
                        },
                      }
                    : null,
                  // タイトル
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: title.length > 30 ? '48px' : '56px',
                        fontWeight: 700,
                        color: 'white',
                        textAlign: 'center',
                        lineHeight: 1.3,
                      },
                      children: title,
                    },
                  },
                ].filter(Boolean),
              },
            },
            // フッター
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  bottom: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background:
                          'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      },
                      children: {
                        type: 'span',
                        props: {
                          style: { color: 'white', fontSize: '24px' },
                          children: 'A',
                        },
                      },
                    },
                  },
                  {
                    type: 'span',
                    props: {
                      style: {
                        color: 'white',
                        fontSize: '28px',
                      },
                      children: 'ADA Lab Blog',
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Noto Sans JP',
            data: fontData,
            weight: 700,
            style: 'normal',
          },
        ],
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      }
    ) as Response;
  } catch (error) {
    console.error('OG image generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
};
