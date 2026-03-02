'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';

interface HelpModalProps {
  show: boolean;
  onClose: () => void;
}

export function HelpModal({ show, onClose }: HelpModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <HelpCircle className="w-6 h-6" />
                遊び方
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-bold mb-2">🎯 目的</h4>
                <p className="text-muted-foreground">
                  相手より多くの駒を自分の色にしましょう。最終的に駒が多い方が勝ちです。
                </p>
              </div>

              <div>
                <h4 className="font-bold mb-2">🖱️ 操作方法</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>・<b>クリック/タップ</b>: 有効なマスに駒を置く</li>
                  <li>・有効な手は<b>半透明のドット</b>で表示されます</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">📏 ルール</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>・あなたは<b>黒（●）</b>、AIは<b>白（○）</b>です</li>
                  <li>・相手の駒を自分の駒で<b>挟む</b>と裏返せます</li>
                  <li>・縦・横・斜めの8方向で挟めます</li>
                  <li>・置ける場所がない場合は<b>自動でパス</b>します</li>
                  <li>・両者とも置けなくなったらゲーム終了</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">🤖 難易度</h4>
                <div className="text-muted-foreground space-y-1">
                  <p>・<b>かんたん</b>: ランダムに手を選びます</p>
                  <p>・<b>ふつう</b>: 良い位置を優先して選びます</p>
                  <p>・<b>むずかしい</b>: 先読みして最善手を選びます</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-2">💡 コツ</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>・<b>角</b>を取ると有利になります</li>
                  <li>・角の隣のマスは相手に角を取られやすいので注意</li>
                  <li>・序盤は取りすぎず、終盤で一気に取るのが定石</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
