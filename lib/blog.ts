import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const BLOG_DIR = path.join(process.cwd(), 'content/blog');

/** URL安全なslugパターン（英数字、ハイフン、アンダースコアのみ） */
const SAFE_SLUG_PATTERN = /^[a-zA-Z0-9-_]+$/;

/**
 * slugが安全かどうかを検証
 */
function isValidSlug(slug: string): boolean {
  return SAFE_SLUG_PATTERN.test(slug);
}

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
}

export type BlogMeta = Omit<BlogPost, 'content'>;

/**
 * 全てのブログ記事のメタデータを取得（日付降順）
 */
export function getAllPosts(): BlogMeta[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  const files = fs.readdirSync(BLOG_DIR).filter(
    (file) => (file.endsWith('.md') || file.endsWith('.mdx')) && !file.startsWith('_')
  );

  const posts: BlogMeta[] = files
    .map((filename): BlogMeta | null => {
      const slug = filename.replace(/\.mdx?$/, '');

      // XSS防止: 安全なslugパターンのみ許可
      if (!isValidSlug(slug)) {
        return null;
      }

      const filePath = path.join(BLOG_DIR, filename);
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

  const mdPath = path.join(BLOG_DIR, `${slug}.md`);
  const mdxPath = path.join(BLOG_DIR, `${slug}.mdx`);

  let filePath: string;
  if (fs.existsSync(mdPath)) {
    filePath = mdPath;
  } else if (fs.existsSync(mdxPath)) {
    filePath = mdxPath;
  } else {
    return null;
  }

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
  };
}

/**
 * 全てのslugを取得（静的生成用）
 */
export function getAllSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => (file.endsWith('.md') || file.endsWith('.mdx')) && !file.startsWith('_'))
    .map((file) => file.replace(/\.mdx?$/, ''))
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
