import satori from 'satori';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// ブログ記事のメタデータを取得
function getAllPosts() {
  const contentDir = path.join(rootDir, 'content', 'blog');
  const posts = [];

  function scanDir(dir, category = '') {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      // _で始まるファイル/ディレクトリはスキップ
      if (item.startsWith('_')) continue;

      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDir(fullPath, item);
      } else if (item.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        // Windows環境の改行コード(CRLF)にも対応
        const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];
          const titleMatch = frontmatter.match(/^title:\s*["']?(.+?)["']?\s*$/m);
          const title = titleMatch ? titleMatch[1] : item.replace('.md', '');
          const slug = item.replace('.md', '');

          posts.push({
            slug,
            title,
            category: category || 'blog',
          });
        }
      }
    }
  }

  scanDir(contentDir);
  return posts;
}

// フォントをキャッシュ
let cachedFont = null;

async function loadFont() {
  if (cachedFont) return cachedFont;

  // ローカルフォントを確認
  const fontPath = path.join(rootDir, 'public', 'fonts', 'NotoSansJP-Bold.ttf');
  if (fs.existsSync(fontPath)) {
    cachedFont = fs.readFileSync(fontPath);
    return cachedFont;
  }

  // Google Fonts APIからフォントをダウンロード
  console.log('Downloading font...');
  const response = await fetch('https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/Japanese/NotoSansCJKjp-Bold.otf');
  if (!response.ok) {
    throw new Error(`Failed to download font: ${response.status}`);
  }
  cachedFont = Buffer.from(await response.arrayBuffer());

  // フォントディレクトリを作成して保存
  const fontDir = path.join(rootDir, 'public', 'fonts');
  if (!fs.existsSync(fontDir)) {
    fs.mkdirSync(fontDir, { recursive: true });
  }
  fs.writeFileSync(fontPath.replace('.ttf', '.otf'), cachedFont);

  return cachedFont;
}

// OGP画像を生成
async function generateOGImage(post, outputDir, fontData) {
  const { slug, title, category } = post;

  const svg = await satori(
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
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
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
                backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
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
                zIndex: 1,
              },
              children: [
                // カテゴリーバッジ
                category && {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px 24px',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
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
                },
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
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                        children: {
                          type: 'span',
                          props: {
                            style: { color: 'white', fontSize: '24px', fontWeight: 700 },
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
    }
  );

  // SVGをPNGに変換
  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  // 出力ディレクトリを作成
  const slugOutputDir = path.join(outputDir, slug);
  if (!fs.existsSync(slugOutputDir)) {
    fs.mkdirSync(slugOutputDir, { recursive: true });
  }

  // 画像を保存
  const outputPath = path.join(slugOutputDir, 'og-image.png');
  fs.writeFileSync(outputPath, png);

  console.log(`Generated: ${outputPath}`);
}

async function main() {
  console.log('Generating OG images...');

  // フォントを先にロード
  const fontData = await loadFont();
  console.log('Font loaded.');

  const posts = getAllPosts();
  const outputDir = path.join(rootDir, 'public', 'og');

  // 出力ディレクトリを作成
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Found ${posts.length} posts.`);

  for (const post of posts) {
    try {
      await generateOGImage(post, outputDir, fontData);
    } catch (error) {
      console.error(`Failed to generate OG image for ${post.slug}:`, error.message);
    }
  }

  console.log('Done!');
}

main().catch(console.error);
