'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Bot } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const responses: Record<string, string> = {
  こんにちは: 'こんにちは！ADA Labへようこそ。プロダクトについて何かご質問はありますか？',
  プロダクト: '現在、ADA Analytics、ADA Connect、ADA Guardなど、6つのプロダクトを開発・運営しています。詳細はProductsセクションをご覧ください。',
  技術: '私たちはReact、Next.js、TypeScript、Node.js、Pythonなどの最新技術を使用して、スケーラブルなプロダクトを開発しています。',
  採用: '積極的に採用を行っています！詳細は採用情報ページをご覧いただくか、お問い合わせフォームからご連絡ください。',
  料金: '各プロダクトの料金プランは、プロダクトページでご確認いただけます。無料トライアルもご用意しています。',
  ユーザー: '現在、50,000以上のアクティブユーザーに私たちのプロダクトをご利用いただいています。',
  連絡: 'お問い合わせはページ下部のフォームからお願いします。24時間以内に返信いたします。',
  会社: 'ADA Labは、革新的なプロダクトで世界を変えるプロダクトカンパニーです。詳細はAboutセクションをご覧ください。',
  default: '申し訳ございません。その質問にはお答えできません。お問い合わせフォームからご連絡いただくか、以下のキーワードでお試しください：\n\n• プロダクト\n• 技術\n• 採用\n• 料金\n• ユーザー\n• 会社\n• 連絡',
};

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'こんにちは！ADA Labのアシスタントです。ご質問をどうぞ。',
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Find response
    const lowerInput = input.toLowerCase();
    let responseText = responses.default;

    for (const [key, value] of Object.entries(responses)) {
      if (lowerInput.includes(key)) {
        responseText = value;
        break;
      }
    }

    // Add bot response after delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    }, 500);

    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-52 right-4 z-[100] w-12 h-12 rounded-full bg-black/90 backdrop-blur-xl border-2 neon-border-blue hover:scale-110 transition-all shadow-2xl flex items-center justify-center group"
        aria-label="AI Chat"
      >
        <MessageCircle className="w-5 h-5 text-blue-400" />

        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/90 backdrop-blur-md border border-blue-400/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          <span className="text-xs text-blue-400 font-mono">
            AIアシスタント
          </span>
        </div>

        {/* Notification dot */}
        {!isOpen && messages.length > 1 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full animate-pulse" />
        )}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-68 right-4 z-[100] w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-10rem)] bg-black/95 backdrop-blur-xl border-2 neon-border-blue rounded-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-blue-400/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold holographic-text">AI Assistant</h3>
                  <div className="flex items-center gap-1 text-xs text-green-400">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span>オンライン</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-3 ${
                      message.isBot
                        ? 'bg-blue-400/20 border border-blue-400/30'
                        : 'bg-cyan-400/20 border border-cyan-400/30'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-blue-400/30">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="メッセージを入力..."
                  className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-400/50 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-lg bg-blue-400/20 border border-blue-400/30 flex items-center justify-center hover:bg-blue-400/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5 text-blue-400" />
                </button>
              </div>
            </div>

            {/* Scanline effect */}
            <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
