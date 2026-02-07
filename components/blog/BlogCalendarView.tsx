'use client';

import { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BlogMeta } from '@/lib/blog';
import { BlogCard } from './BlogCard';

interface BlogCalendarViewProps {
  posts: BlogMeta[];
  postDates: Map<string, number>;
  engagement: Record<string, { views: number; likes: number }>;
  onDateSelect?: (range: { year: number; month: number; day?: number } | null) => void;
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function BlogCalendarView({ posts, postDates, engagement, onDateSelect }: BlogCalendarViewProps) {
  const today = useMemo(() => new Date(), []);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // 日付ごとの記事タイトルマップ
  const postsByDate = useMemo(() => {
    const map = new Map<string, BlogMeta[]>();
    for (const post of posts) {
      const d = new Date(post.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const arr = map.get(key) || [];
      arr.push(post);
      map.set(key, arr);
    }
    return map;
  }, [posts]);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<{ year: number; month: number; day?: number } | null>(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // カレンダーグリッド（6行×7列）
  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    // 空セル
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // 日付セル
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    // 6行分になるまでパディング
    while (days.length < 42) {
      days.push(null);
    }
    return days;
  }, [firstDay, daysInMonth]);

  // 選択中の日付に対応する記事
  const selectedPosts = useMemo(() => {
    if (!selectedDate) return [];
    return posts.filter((post) => {
      const d = new Date(post.date);
      if (d.getFullYear() !== selectedDate.year) return false;
      if (d.getMonth() !== selectedDate.month) return false;
      if (selectedDate.day !== undefined && d.getDate() !== selectedDate.day) return false;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [posts, selectedDate]);

  const goToPrevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDate(null);
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDate(null);
  }, [currentMonth]);

  const goToToday = useCallback(() => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(null);
  }, [today]);

  const handleDayClick = useCallback((day: number) => {
    const newDate = { year: currentYear, month: currentMonth, day };
    // 同じ日をクリックしたらクリア
    if (
      selectedDate?.year === currentYear &&
      selectedDate?.month === currentMonth &&
      selectedDate?.day === day
    ) {
      setSelectedDate(null);
      onDateSelect?.(null);
    } else {
      setSelectedDate(newDate);
      onDateSelect?.(newDate);
    }
  }, [currentYear, currentMonth, selectedDate, onDateSelect]);

  const handleMonthClick = useCallback(() => {
    const newDate = { year: currentYear, month: currentMonth };
    // 同じ月をクリックしたらクリア
    if (
      selectedDate?.year === currentYear &&
      selectedDate?.month === currentMonth &&
      selectedDate?.day === undefined
    ) {
      setSelectedDate(null);
      onDateSelect?.(null);
    } else {
      setSelectedDate(newDate);
      onDateSelect?.(newDate);
    }
  }, [currentYear, currentMonth, selectedDate, onDateSelect]);

  const isToday = (day: number) => {
    return (
      currentYear === today.getFullYear() &&
      currentMonth === today.getMonth() &&
      day === today.getDate()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.year === currentYear &&
      selectedDate.month === currentMonth &&
      selectedDate.day === day
    );
  };

  const isMonthSelected = () => {
    if (!selectedDate) return false;
    return (
      selectedDate.year === currentYear &&
      selectedDate.month === currentMonth &&
      selectedDate.day === undefined
    );
  };

  return (
    <div className="space-y-6">
      {/* カレンダー本体 */}
      <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
        {/* ヘッダー：月ナビゲーション */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <button
            onClick={goToPrevMonth}
            className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            aria-label="前月"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleMonthClick}
              className={`text-lg font-bold transition-colors cursor-pointer px-3 py-1 rounded-lg ${
                isMonthSelected()
                  ? 'text-primary bg-primary/10'
                  : 'hover:text-primary hover:bg-muted'
              }`}
            >
              {currentYear}年{currentMonth + 1}月
            </button>
            <button
              onClick={goToToday}
              className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
            >
              今日
            </button>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            aria-label="次月"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAYS.map((day, i) => (
            <div
              key={day}
              className={`py-2 text-center text-xs font-medium ${
                i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-muted-foreground'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* カレンダーグリッド */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square bg-muted/10 border-b border-r border-border/30" />;
            }

            const dateKey = formatDateKey(currentYear, currentMonth, day);
            const postCount = postDates.get(dateKey) || 0;
            const dayOfWeek = (firstDay + day - 1) % 7;
            const isTodayDate = isToday(day);
            const isSelectedDate = isSelected(day);

            const datePosts = postsByDate.get(dateKey) || [];
            const isHovered = hoveredDate === dateKey && postCount > 0;

            return (
              <div key={dateKey} className="relative">
                <button
                  onClick={() => handleDayClick(day)}
                  onMouseEnter={() => postCount > 0 && setHoveredDate(dateKey)}
                  onMouseLeave={() => setHoveredDate(null)}
                  className={`relative w-full aspect-square flex flex-col items-center justify-center border-b border-r border-border/30 transition-all duration-150 cursor-pointer
                    ${isSelectedDate ? 'bg-primary/20' : 'hover:bg-muted/50'}
                    ${dayOfWeek === 0 ? 'text-red-400' : dayOfWeek === 6 ? 'text-blue-400' : ''}
                  `}
                >
                  <span
                    className={`text-sm font-medium leading-none ${
                      isTodayDate
                        ? 'w-7 h-7 flex items-center justify-center rounded-full ring-2 ring-primary text-primary'
                        : ''
                    } ${isSelectedDate ? 'text-primary font-bold' : ''}`}
                  >
                    {day}
                  </span>

                  {/* 記事ドットインジケーター */}
                  {postCount > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: Math.min(postCount, 3) }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            postCount >= 3
                              ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50'
                              : postCount >= 2
                                ? 'bg-cyan-400/80'
                                : 'bg-cyan-500/60'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>

                {/* ホバーツールチップ */}
                {isHovered && (
                  <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-lg bg-popover border border-border shadow-lg pointer-events-none">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {currentMonth + 1}/{day}の記事
                    </p>
                    {datePosts.map((p) => (
                      <p key={p.slug} className="text-xs text-foreground truncate">
                        {p.title}
                      </p>
                    ))}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 選択された日付の記事 */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            key={`${selectedDate.year}-${selectedDate.month}-${selectedDate.day ?? 'month'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedDate.year}年{selectedDate.month + 1}月
                {selectedDate.day !== undefined && `${selectedDate.day}日`}の記事
              </h3>
              <span className="text-sm text-muted-foreground">
                {selectedPosts.length}件
              </span>
            </div>

            {selectedPosts.length > 0 ? (
              <div className="space-y-3">
                {selectedPosts.map((post) => (
                  <BlogCard
                    key={post.slug}
                    post={post}
                    engagement={engagement[post.slug]}
                    variant="compact"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground rounded-xl border border-border bg-card/50">
                この日には記事がありません
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
