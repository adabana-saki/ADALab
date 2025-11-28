import { getAllPosts } from '@/lib/blog';
import { SITE_CONFIG } from '@/lib/constants';

export const dynamic = 'force-static';

export function GET() {
  const posts = getAllPosts();
  const baseUrl = SITE_CONFIG.url;

  const atomEntries = posts
    .map(
      (post) => `
  <entry>
    <title><![CDATA[${post.title}]]></title>
    <link href="${baseUrl}/blog/${post.slug}" rel="alternate" type="text/html"/>
    <id>${baseUrl}/blog/${post.slug}</id>
    <published>${new Date(post.date).toISOString()}</published>
    <updated>${new Date(post.date).toISOString()}</updated>
    <summary><![CDATA[${post.description}]]></summary>
    ${post.author ? `<author><name>${post.author}</name></author>` : '<author><name>ADA Lab</name></author>'}
    ${post.tags.map((tag) => `<category term="${tag}"/>`).join('\n    ')}
  </entry>`
    )
    .join('');

  const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="ja">
  <title>ADA Lab Blog</title>
  <subtitle>ADA Labのブログ - 技術記事やプロジェクトの進捗を発信しています</subtitle>
  <link href="${baseUrl}/blog" rel="alternate" type="text/html"/>
  <link href="${baseUrl}/atom.xml" rel="self" type="application/atom+xml"/>
  <id>${baseUrl}/</id>
  <updated>${new Date().toISOString()}</updated>
  <icon>${baseUrl}/favicon.ico</icon>
  <logo>${baseUrl}/opengraph-image.png</logo>
  ${atomEntries}
</feed>`;

  return new Response(atom, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
