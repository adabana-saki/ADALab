import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
// @ts-expect-error - WASM module import
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm';

let wasmInitialized = false;

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

interface OGImageProps {
  title: string;
  category?: string;
}

function createOGImageElement({ title, category }: OGImageProps) {
  return {
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
        // 背景パターン
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage:
                'radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
              display: 'flex',
            },
          },
        },
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
              maxWidth: '100%',
            },
            children: [
              // カテゴリーバッジ
              category
                ? {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
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
                            fontWeight: 600,
                          },
                          children: category,
                        },
                      },
                    },
                  }
                : null,
              // タイトル
              {
                type: 'h1',
                props: {
                  style: {
                    fontSize: title.length > 30 ? '48px' : '56px',
                    fontWeight: 700,
                    color: 'white',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    margin: 0,
                    maxWidth: '1000px',
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
              gap: '16px',
            },
            children: {
              type: 'div',
              props: {
                style: {
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
                          style: {
                            color: 'white',
                            fontSize: '24px',
                            fontWeight: 700,
                          },
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
                        fontWeight: 600,
                      },
                      children: 'ADA Lab Blog',
                    },
                  },
                ],
              },
            },
          },
        },
        // 装飾ライン
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '20px',
              left: '20px',
              right: '20px',
              bottom: '20px',
              border: '2px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '24px',
              display: 'flex',
            },
          },
        },
      ],
    },
  };
}

export const onRequestGet: PagesFunction = async (context) => {
  const { request } = context;
  const url = new URL(request.url);

  const title = url.searchParams.get('title') || 'ADA Lab';
  const category = url.searchParams.get('category') || undefined;

  try {
    // WASM初期化
    if (!wasmInitialized) {
      await initWasm(resvgWasm);
      wasmInitialized = true;
    }

    // フォント読み込み
    const fontData = await loadFont();

    // SVG生成
    const svg = await satori(createOGImageElement({ title, category }), {
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
    });

    // PNG変換
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: 'width',
        value: 1200,
      },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return new Response(pngBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('OG image generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
};
