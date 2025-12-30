'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageJump?: boolean;
  siblingCount?: number;
}

// ページ番号の範囲を生成
function generatePageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | 'ellipsis')[] {
  const totalNumbers = siblingCount * 2 + 5; // siblings + first + last + current + 2 ellipsis

  // ページ数が少ない場合は全て表示
  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = Array.from({ length: 3 + 2 * siblingCount }, (_, i) => i + 1);
    return [...leftRange, 'ellipsis', totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRange = Array.from(
      { length: 3 + 2 * siblingCount },
      (_, i) => totalPages - (3 + 2 * siblingCount) + i + 1
    );
    return [1, 'ellipsis', ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  );
  return [1, 'ellipsis', ...middleRange, 'ellipsis', totalPages];
}

export function BlogPagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageJump = true,
  siblingCount = 1,
}: BlogPaginationProps) {
  const [jumpValue, setJumpValue] = useState('');
  const [isJumpFocused, setIsJumpFocused] = useState(false);

  if (totalPages <= 1) return null;

  const pageRange = generatePageRange(currentPage, totalPages, siblingCount);

  const handleJump = () => {
    const page = parseInt(jumpValue, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
      setJumpValue('');
    }
  };

  const handleJumpKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJump();
    }
  };

  return (
    <nav
      className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
      aria-label="ページネーション"
    >
      {/* メインページネーション */}
      <div className="flex items-center gap-1">
        {/* 最初へ */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
          aria-label="最初のページへ"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* 前へ */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
          aria-label="前のページへ"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline text-sm">前へ</span>
        </button>

        {/* ページ番号 */}
        <div className="flex items-center gap-1 mx-2">
          {pageRange.map((page, index) =>
            page === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-2 text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[40px] h-10 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                  currentPage === page
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'border border-border bg-background hover:bg-muted hover:border-primary/50'
                }`}
                aria-label={`${page}ページへ`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* 次へ */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
          aria-label="次のページへ"
        >
          <span className="hidden sm:inline text-sm">次へ</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* 最後へ */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
          aria-label="最後のページへ"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>

      {/* ページジャンプ */}
      {showPageJump && totalPages > 5 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>移動:</span>
          <div className={`relative transition-all duration-200 ${isJumpFocused ? 'ring-2 ring-primary/50' : ''} rounded-lg`}>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              onFocus={() => setIsJumpFocused(true)}
              onBlur={() => setIsJumpFocused(false)}
              onKeyDown={handleJumpKeyDown}
              placeholder={`1-${totalPages}`}
              className="w-20 px-3 py-2 rounded-lg border border-border bg-background text-center text-sm focus:outline-none"
              aria-label="ページ番号を入力"
            />
          </div>
          <button
            onClick={handleJump}
            className="px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium cursor-pointer"
          >
            移動
          </button>
        </div>
      )}

      {/* ページ情報 */}
      <div className="text-sm text-muted-foreground">
        {currentPage} / {totalPages} ページ
      </div>
    </nav>
  );
}
