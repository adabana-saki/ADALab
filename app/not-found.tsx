'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-neon-purple/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-fuchsia/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 text-center">
        {/* Glitch 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-[150px] md:text-[200px] font-bold leading-none logo-text" data-text="404">
            404
          </h1>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4 neon-cyan">
            Page Not Found
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            お探しのページは存在しないか、移動した可能性があります。
            URLをご確認いただくか、ホームページからお探しください。
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button asChild size="lg" className="min-w-[200px]">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              ホームに戻る
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-w-[200px]">
            <Link href="/#contact">
              <Search className="w-4 h-4 mr-2" />
              お問い合わせ
            </Link>
          </Button>
        </motion.div>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12"
        >
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-neon-cyan transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            前のページに戻る
          </button>
        </motion.div>

        {/* Decorative code block */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16"
        >
          <div className="inline-block glass rounded-lg p-4 text-left font-mono text-sm">
            <div className="text-muted-foreground">
              <span className="text-neon-purple">if</span> (page === <span className="text-neon-cyan">&apos;not_found&apos;</span>) {'{'}
            </div>
            <div className="text-muted-foreground pl-4">
              <span className="text-neon-fuchsia">return</span> <span className="text-neon-cyan">&apos;404&apos;</span>;
            </div>
            <div className="text-muted-foreground">{'}'}</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
