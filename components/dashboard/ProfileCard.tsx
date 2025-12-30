'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Edit2, Check, X, Award, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileCardProps {
  profile: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  } | null;
  userProfile?: {
    nickname: string;
    avatar_url: string | null;
    created_at: string;
  } | null;
  totalAchievements: number;
}

export function ProfileCard({ profile, userProfile, totalAchievements }: ProfileCardProps) {
  const { getIdToken } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(userProfile?.nickname || profile?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!profile?.uid || !nickname.trim()) return;

    setIsSaving(true);
    try {
      const token = await getIdToken();
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid: profile.uid,
          nickname: nickname.trim(),
        }),
      });

      if (response.ok) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to save nickname:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = userProfile?.nickname || profile?.displayName || 'ユーザー';
  const avatarUrl = userProfile?.avatar_url || profile?.photoURL;
  const joinDate = userProfile?.created_at
    ? new Date(userProfile.created_at).toLocaleDateString('ja-JP')
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <div className="flex flex-col items-center text-center">
        {/* アバター */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-24 h-24 rounded-full mb-4"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mb-4">
            <User size={40} className="text-primary-foreground" />
          </div>
        )}

        {/* ニックネーム */}
        {isEditing ? (
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              className="px-3 py-1 rounded-lg border border-border bg-background text-center focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-1 rounded hover:bg-muted text-green-500"
            >
              <Check size={18} />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setNickname(userProfile?.nickname || profile?.displayName || '');
              }}
              className="p-1 rounded hover:bg-muted text-red-500"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-bold">{displayName}</h2>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 rounded hover:bg-muted text-muted-foreground"
            >
              <Edit2 size={14} />
            </button>
          </div>
        )}

        {/* メールアドレス */}
        <p className="text-sm text-muted-foreground mb-4">{profile?.email}</p>

        {/* 統計 */}
        <div className="w-full space-y-3 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Award size={16} className="text-yellow-500" />
              <span className="text-sm">実績</span>
            </div>
            <span className="font-bold">{totalAchievements}</span>
          </div>

          {joinDate && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={16} className="text-blue-500" />
                <span className="text-sm">登録日</span>
              </div>
              <span className="text-sm">{joinDate}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
