import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'お名前は2文字以上で入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  inquiryType: z.string().optional(),
  message: z.string().min(10, 'メッセージは10文字以上で入力してください'),
  recaptchaToken: z.string().optional(),
});

// reCAPTCHA検証
async function verifyRecaptcha(token: string): Promise<boolean> {
  if (!process.env.RECAPTCHA_SECRET_KEY) return true;

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();
    return data.success && data.score >= 0.5;
  } catch {
    console.error('reCAPTCHA verification failed');
    return false;
  }
}

// Redis接続
function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// レート制限
function getRatelimit() {
  const redis = getRedis();
  if (!redis) return null;

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'), // 1分に5回まで
  });
}

// 1日の送信数制限
const DAILY_LIMIT = 50; // 100通/日 ÷ 2通/問い合わせ

async function getDailyCount(redis: Redis): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const count = await redis.get<number>(`contact:daily:${today}`);
  return count || 0;
}

async function incrementDailyCount(redis: Redis): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const key = `contact:daily:${today}`;
  await redis.incr(key);
  await redis.expire(key, 86400 * 2); // 2日後に自動削除
}

export async function POST(request: NextRequest) {
  try {
    // IPアドレス取得
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Redis接続
    const redis = getRedis();

    // 1日の送信数制限チェック
    if (redis) {
      const dailyCount = await getDailyCount(redis);
      if (dailyCount >= DAILY_LIMIT) {
        return NextResponse.json(
          { success: false, message: '本日の送信上限に達しました。明日以降にお試しください。' },
          { status: 429 }
        );
      }
    }

    // レート制限チェック
    const ratelimit = getRatelimit();
    if (ratelimit) {
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { success: false, message: '送信回数の上限に達しました。しばらくしてからお試しください。' },
          { status: 429 }
        );
      }
    }

    const body = await request.json();

    // Zodバリデーション
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, inquiryType, message, recaptchaToken } = result.data;

    // reCAPTCHA検証
    if (process.env.RECAPTCHA_SECRET_KEY) {
      if (!recaptchaToken) {
        return NextResponse.json(
          { success: false, message: 'reCAPTCHA検証に失敗しました' },
          { status: 400 }
        );
      }

      const isHuman = await verifyRecaptcha(recaptchaToken);
      if (!isHuman) {
        return NextResponse.json(
          { success: false, message: 'ボットと判定されました。もう一度お試しください。' },
          { status: 400 }
        );
      }
    }

    // APIキーがない場合はエラー
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        { success: false, message: 'メール送信が設定されていません' },
        { status: 500 }
      );
    }

    // メール送信
    const resend = new Resend(process.env.RESEND_API_KEY);

    // 複数の管理者メールアドレスを取得（カンマ区切り対応）
    const contactEmails = process.env.CONTACT_EMAILS
      ? process.env.CONTACT_EMAILS.split(',').map(e => e.trim()).filter(Boolean)
      : [];

    if (contactEmails.length === 0) {
      console.error('CONTACT_EMAILS is not configured');
      return NextResponse.json(
        { success: false, message: '管理者メールが設定されていません' },
        { status: 500 }
      );
    }

    // 管理者への通知メール
    const { error: adminError } = await resend.emails.send({
      from: 'ADA Lab <onboarding@resend.dev>',
      to: contactEmails,
      replyTo: email,
      subject: `[ADA Lab] お問い合わせ: ${inquiryType || '一般'}`,
      html: `
        <h2>お問い合わせがありました</h2>
        <p><strong>お名前:</strong> ${name}</p>
        <p><strong>メールアドレス:</strong> ${email}</p>
        <p><strong>お問い合わせ種別:</strong> ${inquiryType || '未選択'}</p>
        <p><strong>メッセージ:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    if (adminError) {
      console.error('Resend error:', adminError);
      return NextResponse.json(
        { success: false, message: 'メール送信に失敗しました' },
        { status: 500 }
      );
    }

    // 送信者への確認メール
    await resend.emails.send({
      from: 'ADA Lab <onboarding@resend.dev>',
      to: email,
      subject: '[ADA Lab] お問い合わせを受け付けました',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">お問い合わせありがとうございます</h2>
          <p>${name} 様</p>
          <p>以下の内容でお問い合わせを受け付けました。</p>
          <p>内容を確認次第、ご連絡いたします。</p>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>お問い合わせ種別:</strong> ${inquiryType || '未選択'}</p>
            <p><strong>メッセージ:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            このメールは自動送信です。<br>
            ADA Lab - <a href="https://adalab.dev">https://adalab.dev</a>
          </p>
        </div>
      `,
    });

    // 送信数をカウント
    if (redis) {
      await incrementDailyCount(redis);
    }

    return NextResponse.json({
      success: true,
      message: '送信完了しました。ご連絡ありがとうございます！',
    });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
