import type { ContactFormData } from '@/types';

// Web3Forms APIキー（環境変数から取得）
// https://web3forms.com/ で無料のAPIキーを取得できます
const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || 'YOUR_ACCESS_KEY_HERE';

export async function submitContactForm(data: ContactFormData): Promise<{ success: boolean; message: string }> {
  try {
    // Web3Forms APIを使用（無料で使えるフォーム送信サービス）
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        name: data.name,
        email: data.email,
        subject: `ADA Lab - ${data.projectType || 'お問い合わせ'}`,
        message: `
プロジェクトタイプ: ${data.projectType}

メッセージ:
${data.message}
        `.trim(),
      }),
    });

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        message: 'お問い合わせありがとうございます。24時間以内に返信いたします。',
      };
    } else {
      return {
        success: false,
        message: '送信に失敗しました。もう一度お試しください。',
      };
    }
  } catch (error) {
    console.error('Form submission error:', error);
    return {
      success: false,
      message: 'エラーが発生しました。しばらくしてからもう一度お試しください。',
    };
  }
}

// ローカル開発用のダミー関数
export async function submitContactFormMock(data: ContactFormData): Promise<{ success: boolean; message: string }> {
  console.log('Form data:', data);

  // シミュレート: 2秒待機
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // ランダムに成功/失敗を返す（開発用）
  const success = Math.random() > 0.2;

  return {
    success,
    message: success
      ? 'お問い合わせありがとうございます。24時間以内に返信いたします。'
      : '送信に失敗しました。もう一度お試しください。',
  };
}
