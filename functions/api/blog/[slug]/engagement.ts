// Cloudflare Pages Function for individual post engagement
import { Redis } from '@upstash/redis/cloudflare';

interface Env {
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
}

const REDIS_KEYS = {
  views: (slug: string) => `views:${slug}`,
  likes: (slug: string) => `likes:${slug}`,
  userLiked: (slug: string, visitorId: string) => `liked:${slug}:${visitorId}`,
};

// GET: 記事のエンゲージメントデータを取得
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { params, request, env } = context;
  const slug = params.slug as string;

  try {
    const url = new URL(request.url);
    const visitorId = url.searchParams.get('visitorId');

    const redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });

    const pipeline = redis.pipeline();
    pipeline.get(REDIS_KEYS.views(slug));
    pipeline.get(REDIS_KEYS.likes(slug));
    if (visitorId) {
      pipeline.exists(REDIS_KEYS.userLiked(slug, visitorId));
    }

    const results = await pipeline.exec();

    const views = (results[0] as number) || 0;
    const likes = (results[1] as number) || 0;
    const hasLiked = visitorId ? (results[2] as number) === 1 : false;

    return new Response(JSON.stringify({ views, likes, hasLiked }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Engagement GET error:', error);
    return new Response(JSON.stringify({ views: 0, likes: 0, hasLiked: false }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST: ビューをカウントまたはいいねをトグル
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { params, request, env } = context;
  const slug = params.slug as string;

  try {
    const { action, visitorId } = await request.json() as {
      action: 'view' | 'like';
      visitorId: string;
    };

    const redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });

    if (action === 'view') {
      // ビュー数をインクリメント
      await redis.incr(REDIS_KEYS.views(slug));
      const [views, likes] = await Promise.all([
        redis.get(REDIS_KEYS.views(slug)),
        redis.get(REDIS_KEYS.likes(slug)),
      ]);

      return new Response(
        JSON.stringify({
          views: (views as number) || 0,
          likes: (likes as number) || 0,
          hasLiked: false,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (action === 'like') {
      if (!visitorId) {
        return new Response(JSON.stringify({ error: 'Visitor ID required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const userLikedKey = REDIS_KEYS.userLiked(slug, visitorId);
      const likesKey = REDIS_KEYS.likes(slug);

      // アトミックなトランザクションでいいねをトグル（競合状態を防止）
      // WATCH/MULTI/EXECパターンの代わりにLuaスクリプトを使用
      const luaScript = `
        local userLikedKey = KEYS[1]
        local likesKey = KEYS[2]
        local hasLiked = redis.call('EXISTS', userLikedKey)

        if hasLiked == 1 then
          redis.call('DEL', userLikedKey)
          redis.call('DECR', likesKey)
          return 0
        else
          redis.call('SET', userLikedKey, '1', 'EX', 31536000)
          redis.call('INCR', likesKey)
          return 1
        end
      `;

      const newHasLiked = await redis.eval(
        luaScript,
        [userLikedKey, likesKey],
        []
      ) as number;

      const [views, likes] = await Promise.all([
        redis.get(REDIS_KEYS.views(slug)),
        redis.get(REDIS_KEYS.likes(slug)),
      ]);

      return new Response(
        JSON.stringify({
          views: (views as number) || 0,
          likes: Math.max(0, (likes as number) || 0),
          hasLiked: newHasLiked === 1,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Engagement POST error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update engagement' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
