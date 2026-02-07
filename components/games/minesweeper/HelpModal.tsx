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
                  地雷を踏まずにすべてのセルを開けましょう。
                </p>
              </div>

              <div>
                <h4 className="font-bold mb-2">🖱️ 操作方法</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>・<b>左クリック</b>: セルを開く</li>
                  <li>・<b>右クリック</b>: フラグを立てる/外す</li>
                  <li>・<b>ダブルクリック</b>: 数字セルの周囲を一括開示</li>
                  <li>・<b>長押し（モバイル）</b>: フラグを立てる</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">🔢 数字の意味</h4>
                <p className="text-muted-foreground">
                  数字は周囲8マスにある地雷の数を示します。
                </p>
              </div>

              <div>
                <h4 className="font-bold mb-2">📊 難易度</h4>
                <div className="text-muted-foreground space-y-1">
                  <p>・初級: 9×9 / 地雷10個</p>
                  <p>・中級: 16×16 / 地雷40個</p>
                  <p>・上級: 30×16 / 地雷99個</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
