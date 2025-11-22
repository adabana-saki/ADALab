'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

export function VoiceCommands() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);

      const recognition = new SpeechRecognition();
      recognition.lang = 'ja-JP';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const speechResult = event.results[0][0].transcript.toLowerCase();
        setTranscript(speechResult);
        handleCommand(speechResult);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleCommand = (command: string) => {
    console.log('Voice command:', command);

    // Navigate commands
    if (command.includes('ホーム') || command.includes('トップ')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (command.includes('プロジェクト')) {
      document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
    } else if (command.includes('サービス')) {
      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
    } else if (command.includes('技術') || command.includes('テクノロジー')) {
      document.getElementById('technologies')?.scrollIntoView({ behavior: 'smooth' });
    } else if (command.includes('問い合わせ') || command.includes('コンタクト')) {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }

    // Action commands
    else if (command.includes('実績') || command.includes('アチーブメント')) {
      // Open achievements modal
      const event = new KeyboardEvent('keydown', {
        key: 'a',
        ctrlKey: true,
        shiftKey: true,
      });
      window.dispatchEvent(event);
    } else if (command.includes('テーマ')) {
      // Open theme settings
      const themeButton = document.querySelector('[aria-label="Theme settings"]') as HTMLButtonElement;
      themeButton?.click();
    } else if (command.includes('サウンド')) {
      // Toggle sound
      const soundButton = document.querySelector('[aria-label="Toggle sound effects"]') as HTMLButtonElement;
      soundButton?.click();
    }

    // Clear transcript after 3 seconds
    setTimeout(() => setTranscript(''), 3000);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  if (!isSupported) return null;

  return (
    <>
      {/* Voice Command Button */}
      <button
        onClick={toggleListening}
        className={`fixed bottom-[17rem] right-4 z-[150] w-12 h-12 rounded-full backdrop-blur-xl border-2 hover:scale-110 transition-all shadow-2xl flex items-center justify-center group ${
          isListening
            ? 'bg-red-500/20 neon-border-red animate-pulse'
            : 'bg-black/80 neon-border-green'
        }`}
        aria-label="Voice commands"
      >
        {isListening ? (
          <Mic className="w-5 h-5 text-red-400 animate-pulse" />
        ) : (
          <MicOff className="w-5 h-5 text-green-400" />
        )}

        {/* Tooltip */}
        <div className="absolute right-full mr-2 px-3 py-1 bg-black/90 backdrop-blur-md border border-green-400/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          <span className="text-xs text-green-400 font-mono">
            音声コマンド {isListening ? '(聞いています...)' : '(V)'}
          </span>
        </div>

        {/* Listening indicator */}
        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-red-400"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </button>

      {/* Transcript Display */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-[19rem] right-4 z-[150] max-w-xs bg-black/95 backdrop-blur-xl border-2 neon-border-green rounded-xl p-4 shadow-2xl"
          >
            <div className="text-sm font-mono text-green-400">
              「{transcript}」
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Commands Help */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[150] bg-black/95 backdrop-blur-xl border-2 neon-border-green rounded-xl p-6 shadow-2xl max-w-md"
          >
            <h3 className="text-lg font-bold holographic-text mb-4">
              音声コマンド一覧
            </h3>

            <div className="space-y-2 text-sm">
              <div className="p-2 rounded bg-white/5">
                <span className="text-green-400">「ホーム」</span> - トップへ移動
              </div>
              <div className="p-2 rounded bg-white/5">
                <span className="text-green-400">「プロジェクト」</span> - プロジェクトセクション
              </div>
              <div className="p-2 rounded bg-white/5">
                <span className="text-green-400">「サービス」</span> - サービスセクション
              </div>
              <div className="p-2 rounded bg-white/5">
                <span className="text-green-400">「技術」</span> - 技術セクション
              </div>
              <div className="p-2 rounded bg-white/5">
                <span className="text-green-400">「問い合わせ」</span> - お問い合わせ
              </div>
              <div className="p-2 rounded bg-white/5">
                <span className="text-green-400">「実績」</span> - 実績を表示
              </div>
              <div className="p-2 rounded bg-white/5">
                <span className="text-green-400">「テーマ」</span> - テーマ設定
              </div>
            </div>

            <div className="mt-4 text-xs text-muted-foreground text-center">
              話しかけてください...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
