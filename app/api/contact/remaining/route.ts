import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const DAILY_LIMIT = 50;

export async function GET() {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      // Redisが設定されていない場合は制限なしとして扱う
      return NextResponse.json({ remaining: DAILY_LIMIT, limit: DAILY_LIMIT });
    }

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    const today = new Date().toISOString().split('T')[0];
    const count = await redis.get<number>(`contact:daily:${today}`) || 0;
    const remaining = Math.max(0, DAILY_LIMIT - count);

    return NextResponse.json({ remaining, limit: DAILY_LIMIT });
  } catch (error) {
    console.error('Remaining API error:', error);
    return NextResponse.json({ remaining: DAILY_LIMIT, limit: DAILY_LIMIT });
  }
}
