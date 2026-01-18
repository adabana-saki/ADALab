'use client';

import { useState, useEffect, useCallback } from 'react';
import { Music, Volume2, VolumeX, ChevronDown, Zap } from 'lucide-react';
import { getSoundEngine, GAME_BGM_TRACKS, BgmTrack } from '@/lib/sound-engine';

interface BgmControlProps {
  game: 'snake' | '2048' | 'typing' | 'minesweeper';
  isPlaying: boolean;
  className?: string;
}

export function BgmControl({ game, isPlaying, className = '' }: BgmControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string>('none');
  const [bgmVolume, setBgmVolume] = useState(0.5);
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);

  // 効果音設定
  const [seEnabled, setSeEnabled] = useState(true);
  const [seVolume, setSeVolume] = useState(0.5);

  const soundEngine = getSoundEngine();
  const tracks: BgmTrack[] = GAME_BGM_TRACKS[game] || [];

  // 初期化
  useEffect(() => {
    const savedTrack = soundEngine.getBgmTrack(game);
    setCurrentTrack(savedTrack);
    setBgmVolume(soundEngine.getBgmVolume());
    setSeEnabled(soundEngine.isEnabled());
    setSeVolume(soundEngine.getVolume());
  }, [game, soundEngine]);

  // ゲーム状態に応じたBGM制御
  useEffect(() => {
    if (isPlaying && currentTrack !== 'none') {
      soundEngine.startBgm(game, currentTrack);
      setIsBgmPlaying(true);
    } else {
      soundEngine.stopBgm();
      setIsBgmPlaying(false);
    }

    return () => {
      soundEngine.stopBgm();
    };
  }, [isPlaying, currentTrack, game, soundEngine]);

  const handleTrackChange = useCallback(
    (trackId: string) => {
      setCurrentTrack(trackId);
      soundEngine.setBgmTrack(game, trackId);
      setIsOpen(false);

      if (isPlaying && trackId !== 'none') {
        soundEngine.startBgm(game, trackId);
        setIsBgmPlaying(true);
      } else if (trackId === 'none') {
        soundEngine.stopBgm();
        setIsBgmPlaying(false);
      }
    },
    [game, isPlaying, soundEngine]
  );

  const handleBgmVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setBgmVolume(newVolume);
      soundEngine.setBgmVolume(newVolume);
    },
    [soundEngine]
  );

  // 効果音ON/OFF
  const handleSeToggle = useCallback(() => {
    const newEnabled = !seEnabled;
    setSeEnabled(newEnabled);
    soundEngine.setEnabled(newEnabled);
    // テスト音を鳴らす
    if (newEnabled) {
      soundEngine.click();
    }
  }, [seEnabled, soundEngine]);

  // 効果音音量
  const handleSeVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setSeVolume(newVolume);
      soundEngine.setVolume(newVolume);
    },
    [soundEngine]
  );

  const currentTrackLabel = tracks.find((t) => t.id === currentTrack)?.label || 'OFF';

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          border transition-all duration-200
          ${
            isBgmPlaying
              ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
              : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'
          }
        `}
        title="サウンド設定"
      >
        <Music className={`w-4 h-4 ${isBgmPlaying ? 'animate-pulse' : ''}`} />
        <span className="text-sm hidden sm:inline">{currentTrackLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
            {/* 効果音設定 */}
            <div className="p-3 border-b border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-slate-300">効果音</span>
                <button
                  onClick={handleSeToggle}
                  className={`ml-auto px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                    seEnabled
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-slate-700 text-slate-500'
                  }`}
                >
                  {seEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <VolumeX className="w-3 h-3 text-slate-500" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={seVolume}
                  onChange={handleSeVolumeChange}
                  disabled={!seEnabled}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500 disabled:opacity-50"
                />
                <Volume2 className="w-3 h-3 text-slate-500" />
                <span className="text-xs text-slate-500 w-8">{Math.round(seVolume * 100)}%</span>
              </div>
            </div>

            {/* BGM音量 */}
            <div className="p-3 border-b border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Music className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-slate-300">BGM音量</span>
                <span className="text-xs text-slate-500 ml-auto">{Math.round(bgmVolume * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <VolumeX className="w-3 h-3 text-slate-500" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={bgmVolume}
                  onChange={handleBgmVolumeChange}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <Volume2 className="w-3 h-3 text-slate-500" />
              </div>
            </div>

            {/* BGMトラック選択 */}
            <div className="p-2">
              <p className="text-xs text-slate-500 px-2 mb-1">BGMトラック</p>
              {tracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => handleTrackChange(track.id)}
                  className={`
                    w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                    ${
                      currentTrack === track.id
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'text-slate-300 hover:bg-slate-700/50'
                    }
                  `}
                >
                  {track.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
