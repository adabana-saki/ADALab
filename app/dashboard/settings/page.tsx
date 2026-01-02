'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Volume2,
  VolumeX,
  Globe,
  Palette,
  Save,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGameSettings, GlobalSettings } from '@/hooks/useGameSettings';

export default function SettingsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { settings, updateSettings, loading: settingsLoading, error } = useGameSettings('global');
  const [localSettings, setLocalSettings] = useState<GlobalSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings as GlobalSettings);
    }
  }, [settings]);

  const handleSave = async () => {
    if (localSettings) {
      setIsSaving(true);
      try {
        await updateSettings(localSettings);
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (authLoading || settingsLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        </div>
      </main>
    );
  }

  if (!user || !profile) {
    return null;
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
              <p className="font-medium">設定の読み込みに失敗しました</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft size={20} />
              <span>ダッシュボードに戻る</span>
            </Link>
            <h1 className="text-3xl font-bold">設定</h1>
            <p className="text-muted-foreground mt-2">
              アカウントとゲームの設定を管理します
            </p>
          </motion.div>

          {/* Settings Sections */}
          <div className="space-y-6">
            {/* Profile Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <User className="text-primary" size={24} />
                <h2 className="text-xl font-semibold">プロフィール</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    ニックネーム
                  </label>
                  <input
                    type="text"
                    value={localSettings?.nickname || profile.displayName || ''}
                    onChange={(e) =>
                      setLocalSettings((prev) =>
                        prev ? { ...prev, nickname: e.target.value } : prev
                      )
                    }
                    maxLength={20}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="ニックネームを入力"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    最大20文字。ランキングに表示されます。
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={profile.email || ''}
                    disabled
                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>
            </motion.section>

            {/* Sound Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                {localSettings?.soundEnabled ? (
                  <Volume2 className="text-primary" size={24} />
                ) : (
                  <VolumeX className="text-muted-foreground" size={24} />
                )}
                <h2 className="text-xl font-semibold">サウンド</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>効果音</span>
                  <button
                    role="switch"
                    aria-checked={localSettings?.soundEnabled || false}
                    aria-label="効果音の切り替え"
                    onClick={() =>
                      setLocalSettings((prev) =>
                        prev ? { ...prev, soundEnabled: !prev.soundEnabled } : prev
                      )
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      localSettings?.soundEnabled ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        localSettings?.soundEnabled ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
                {localSettings?.soundEnabled && (
                  <div>
                    <label htmlFor="volume-slider" className="block text-sm text-muted-foreground mb-2">
                      音量: {Math.round((localSettings?.soundVolume || 0.5) * 100)}%
                    </label>
                    <input
                      id="volume-slider"
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={localSettings?.soundVolume || 0.5}
                      onChange={(e) =>
                        setLocalSettings((prev) =>
                          prev ? { ...prev, soundVolume: parseFloat(e.target.value) } : prev
                        )
                      }
                      aria-label="音量"
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </motion.section>

            {/* Appearance Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Palette className="text-primary" size={24} />
                <h2 className="text-xl font-semibold">外観</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    テーマ
                  </label>
                  <div className="flex gap-2">
                    {(['light', 'dark', 'system'] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() =>
                          setLocalSettings((prev) =>
                            prev ? { ...prev, theme } : prev
                          )
                        }
                        className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                          localSettings?.theme === theme
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {theme === 'light' ? 'ライト' : theme === 'dark' ? 'ダーク' : 'システム'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Language Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Globe className="text-primary" size={24} />
                <h2 className="text-xl font-semibold">言語</h2>
              </div>
              <div className="flex gap-2">
                {(['ja', 'en'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() =>
                      setLocalSettings((prev) =>
                        prev ? { ...prev, language: lang } : prev
                      )
                    }
                    className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                      localSettings?.language === lang
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {lang === 'ja' ? '日本語' : 'English'}
                  </button>
                ))}
              </div>
            </motion.section>

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>保存中...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>設定を保存</span>
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
