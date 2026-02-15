'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { User, LogOut, LayoutDashboard, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from './AuthModal';

export function UserButton() {
  const { user, profile, loading, signOut } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
    );
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          <User size={18} />
          <span className="hidden sm:inline">ログイン</span>
        </button>
        <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted transition-colors"
      >
        {profile?.photoURL && !imageError ? (
          <img
            src={profile.photoURL}
            alt={profile.displayName || 'User'}
            className="w-8 h-8 rounded-full"
            onError={handleImageError}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
            {profile?.displayName?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
          {profile?.displayName || profile?.email?.split('@')[0]}
        </span>
        <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-56 rounded-lg bg-card border border-border shadow-lg py-2 z-50"
          >
            {/* ユーザー情報 */}
            <div className="px-4 py-2 border-b border-border">
              <p className="font-medium truncate">
                {profile?.displayName || 'ユーザー'}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {profile?.email}
              </p>
            </div>

            {/* メニュー */}
            <div className="py-1">
              <Link
                href="/dashboard"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
              >
                <LayoutDashboard size={18} />
                <span>ダッシュボード</span>
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
              >
                <Settings size={18} />
                <span>設定</span>
              </Link>
            </div>

            {/* ログアウト */}
            <div className="border-t border-border pt-1">
              <button
                onClick={() => {
                  signOut();
                  setShowDropdown(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors text-red-500"
              >
                <LogOut size={18} />
                <span>ログアウト</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
