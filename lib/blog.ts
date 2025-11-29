import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import yaml from 'js-yaml';

const BLOG_DIR = path.join(process.cwd(), 'content/blog');

/** URL安全なslugパターン（英数字、ハイフン、アンダースコアのみ） */
const SAFE_SLUG_PATTERN = /^[a-zA-Z0-9-_]+$/;

/** カテゴリーディレクトリとして無視するパターン */
const IGNORED_DIRS = ['_templates', '_drafts'];

/**
 * slugが安全かどうかを検証
 */
function isValidSlug(slug: string): boolean {
  return SAFE_SLUG_PATTERN.test(slug);
}

// =============================================================================
// 型定義
// =============================================================================

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  image?: string;
  author?: string;
  readingTime: string;
  content: string;
  category?: string;
  series?: string;
  seriesOrder?: number;
  draft?: boolean;
}

export type BlogMeta = Omit<BlogPost, 'content'>;

export interface Category {
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  order: number;
  postCount?: number;
}

export interface Series {
  id: string;
  title: string;
  description: string;
  posts: string[];
  level?: string;
  completed?: boolean;
}

// =============================================================================
// カテゴリー関連
// =============================================================================

/**
 * 全てのカテゴリーを取得
 */
export function getAllCategories(): Category[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  const entries = fs.readdirSync(BLOG_DIR, { withFileTypes: true });
  const categories: Category[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('_') || IGNORED_DIRS.includes(entry.name)) continue;

    const categoryPath = path.join(BLOG_DIR, entry.name, '_category.yaml');
    if (fs.existsSync(categoryPath)) {
      try {
        const content = fs.readFileSync(categoryPath, 'utf-8');
        const data = yaml.load(content) as Category;

        // 記事数をカウント
        const postsInCategory = getPostsByCategory(entry.name);

        categories.push({
          ...data,
          slug: entry.name,
          postCount: postsInCategory.length,
        });
      } catch {
        // カテゴリー設定ファイルのパースエラーは無視
      }
    }
  }

  return categories.sort((a, b) => a.order - b.order);
}

/**
 * 指定したカテゴリーの記事を取得
 */
export function getPostsByCategory(category: string): BlogMeta[] {
  return getAllPosts().filter((post) => post.category === category);
}

// =============================================================================
// シリーズ関連
// =============================================================================

/**
 * 全てのシリーズを取得
 */
export function getAllSeries(): Series[] {
  const seriesPath = path.join(BLOG_DIR, '_series.yaml');
  if (!fs.existsSync(seriesPath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(seriesPath, 'utf-8');
    const data = yaml.load(content) as Record<string, Omit<Series, 'id'>>;

    return Object.entries(data).map(([id, series]) => ({
      id,
      ...series,
    }));
  } catch {
    return [];
  }
}

/**
 * 指定した記事が属するシリーズを取得
 */
export function getSeriesForPost(slug: string): { series: Series; currentIndex: number; prev?: BlogMeta; next?: BlogMeta } | null {
  const allSeries = getAllSeries();

  for (const series of allSeries) {
    const index = series.posts.findIndex((postSlug) => {
      // カテゴリー/スラッグ形式またはスラッグのみに対応
      const normalizedSlug = postSlug.includes('/') ? postSlug.split('/').pop() : postSlug;
      return normalizedSlug === slug || postSlug === slug;
    });

    if (index !== -1) {
      const prevSlug = index > 0 ? series.posts[index - 1] : undefined;
      const nextSlug = index < series.posts.length - 1 ? series.posts[index + 1] : undefined;

      return {
        series,
        currentIndex: index,
        prev: prevSlug ? getPostBySlug(prevSlug.split('/').pop() || prevSlug) || undefined : undefined,
        next: nextSlug ? getPostBySlug(nextSlug.split('/').pop() || nextSlug) || undefined : undefined,
      };
    }
  }

  return null;
}

// =============================================================================
// 記事取得
// =============================================================================

/**
 * カテゴリー内のMarkdownファイルを再帰的に取得
 */
function getMarkdownFiles(dir: string, category?: string): { filePath: string; category?: string }[] {
  const files: { filePath: string; category?: string }[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // 無視するディレクトリはスキップ
      if (entry.name.startsWith('_') || IGNORED_DIRS.includes(entry.name)) {
        continue;
      }
      // サブディレクトリ（カテゴリー）を再帰的に探索
      files.push(...getMarkdownFiles(fullPath, entry.name));
    } else if (
      (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) &&
      !entry.name.startsWith('_')
    ) {
      files.push({ filePath: fullPath, category });
    }
  }

  return files;
}

/**
 * 全てのブログ記事のメタデータを取得（日付降順）
 */
export function getAllPosts(): BlogMeta[] {
  const markdownFiles = getMarkdownFiles(BLOG_DIR);

  const posts: BlogMeta[] = markdownFiles
    .map(({ filePath, category }): BlogMeta | null => {
      const filename = path.basename(filePath);
      const slug = filename.replace(/\.mdx?$/, '');

      // XSS防止: 安全なslugパターンのみ許可
      if (!isValidSlug(slug)) {
        return null;
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);

      // 下書きは除外
      if (data.draft === true) {
        return null;
      }

      return {
        slug,
        title: data.title || 'Untitled',
        date: data.date || new Date().toISOString().split('T')[0],
        description: data.description || '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        image: data.image,
        author: data.author,
        readingTime: readingTime(content).text,
        category: category || data.category,
        series: data.series,
        seriesOrder: data.seriesOrder,
      };
    })
    .filter((post): post is BlogMeta => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

/**
 * 指定したslugの記事を取得
 */
export function getPostBySlug(slug: string): BlogPost | null {
  // XSS防止: 安全なslugパターンのみ許可
  if (!isValidSlug(slug)) {
    return null;
  }

  // まずルートディレクトリを確認（後方互換性）
  const rootMdPath = path.join(BLOG_DIR, `${slug}.md`);
  const rootMdxPath = path.join(BLOG_DIR, `${slug}.mdx`);

  if (fs.existsSync(rootMdPath)) {
    return parsePostFile(rootMdPath, slug);
  }
  if (fs.existsSync(rootMdxPath)) {
    return parsePostFile(rootMdxPath, slug);
  }

  // カテゴリーディレクトリを探索
  const entries = fs.readdirSync(BLOG_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('_') || IGNORED_DIRS.includes(entry.name)) continue;

    const categoryMdPath = path.join(BLOG_DIR, entry.name, `${slug}.md`);
    const categoryMdxPath = path.join(BLOG_DIR, entry.name, `${slug}.mdx`);

    if (fs.existsSync(categoryMdPath)) {
      return parsePostFile(categoryMdPath, slug, entry.name);
    }
    if (fs.existsSync(categoryMdxPath)) {
      return parsePostFile(categoryMdxPath, slug, entry.name);
    }
  }

  return null;
}

/**
 * Markdownファイルをパースして記事オブジェクトを返す
 */
function parsePostFile(filePath: string, slug: string, category?: string): BlogPost {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  return {
    slug,
    title: data.title || 'Untitled',
    date: data.date || new Date().toISOString().split('T')[0],
    description: data.description || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    image: data.image,
    author: data.author,
    readingTime: readingTime(content).text,
    content,
    category: category || data.category,
    series: data.series,
    seriesOrder: data.seriesOrder,
    draft: data.draft,
  };
}

/**
 * 全てのslugを取得（静的生成用）
 */
export function getAllSlugs(): string[] {
  const markdownFiles = getMarkdownFiles(BLOG_DIR);

  return markdownFiles
    .map(({ filePath }) => {
      const filename = path.basename(filePath);
      return filename.replace(/\.mdx?$/, '');
    })
    .filter(isValidSlug);
}

/**
 * タグ別に記事を取得
 */
export function getPostsByTag(tag: string): BlogMeta[] {
  return getAllPosts().filter((post) => post.tags.includes(tag));
}

/**
 * 全てのタグを取得（使用回数付き）
 */
export function getAllTags(): { name: string; count: number }[] {
  const posts = getAllPosts();
  const tagCount: Record<string, number> = {};

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 関連記事を取得
 */
export function getRelatedPosts(currentSlug: string, limit = 3): BlogMeta[] {
  const currentPost = getPostBySlug(currentSlug);
  if (!currentPost) return [];

  const allPosts = getAllPosts().filter((p) => p.slug !== currentSlug);

  // スコアリング
  const scored = allPosts.map((post) => {
    let score = 0;

    // 同じカテゴリーは高スコア
    if (post.category && post.category === currentPost.category) {
      score += 10;
    }

    // 同じシリーズは高スコア
    if (post.series && post.series === currentPost.series) {
      score += 15;
    }

    // タグの一致数
    const matchingTags = post.tags.filter((tag) => currentPost.tags.includes(tag));
    score += matchingTags.length * 3;

    return { post, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post);
}
