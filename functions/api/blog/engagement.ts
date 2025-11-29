// Cloudflare Pages Function for bulk engagement data
import { Redis } from '@upstash/redis/cloudflare';

interface Env {
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
}

const REDIS_KEYS = {
  views: (slug: string) => `views:${slug}`,
  likes: (slug: string) => `likes:${slug}`,
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const { slugs } = await request.json() as { slugs: string[] };

    if (!slugs || !Array.isArray(slugs)) {
      return new Response(JSON.stringify({ error: 'Invalid slugs' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });

    // パイプラインで全記事のビュー数といいね数を取得
    const pipeline = redis.pipeline();
    for (const slug of slugs) {
      pipeline.get(REDIS_KEYS.views(slug));
      pipeline.get(REDIS_KEYS.likes(slug));
    }

    const results = await pipeline.exec();

    // 結果をオブジェクトに整形
    const engagement: Record<string, { views: number; likes: number }> = {};
    for (let i = 0; i < slugs.length; i++) {
      const views = (results[i * 2] as number) || 0;
      const likes = (results[i * 2 + 1] as number) || 0;
      engagement[slugs[i]] = { views, likes };
    }

    return new Response(JSON.stringify(engagement), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    console.error('Engagement fetch error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch engagement' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
