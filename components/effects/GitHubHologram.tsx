'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface StatItemProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  delay: number;
}

interface GitHubStats {
  repos: number;
  stars: number;
  followers: number;
  accountAge: number;
}

function StatItem({ label, value, maxValue, color, delay }: StatItemProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = Math.min((value / maxValue) * 100, 100);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const timer = setTimeout(() => {
      let current = 0;
      const increment = value / 30;
      intervalId = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          if (intervalId) clearInterval(intervalId);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, 30);
    }, delay * 1000);

    return () => {
      clearTimeout(timer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="mb-4"
    >
      <div className="flex justify-between items-center mb-1">
        <span className="font-mono text-xs text-neon-cyan uppercase tracking-wider">
          {label}
        </span>
        <span className="font-mono text-sm font-bold" style={{ color }}>
          {displayValue}
        </span>
      </div>
      <div className="relative h-2 bg-black/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: delay + 0.3 }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: delay + 0.3 }}
          className="absolute inset-y-0 left-0 rounded-full blur-sm opacity-50"
          style={{ backgroundColor: color }}
        />
      </div>
    </motion.div>
  );
}

export function GitHubHologram() {
  const [githubStats, setGithubStats] = useState<GitHubStats>({
    repos: 0,
    stars: 0,
    followers: 0,
    accountAge: 0,
  });
  useEffect(() => {
    async function fetchGitHubStats() {
      try {
        // Fetch user data
        const userResponse = await fetch('https://api.github.com/users/adabana-saki');
        if (!userResponse.ok) {
          throw new Error(`HTTP error: ${userResponse.status}`);
        }
        const userData = await userResponse.json();

        // Validate required fields
        if (!userData.created_at) {
          throw new Error('Invalid user data');
        }

        // Fetch repos to calculate total stars
        const reposResponse = await fetch('https://api.github.com/users/adabana-saki/repos?per_page=100');
        if (!reposResponse.ok) {
          throw new Error(`HTTP error: ${reposResponse.status}`);
        }
        const reposData = await reposResponse.json();

        const totalStars = Array.isArray(reposData)
          ? reposData.reduce((acc: number, repo: { stargazers_count: number }) => acc + repo.stargazers_count, 0)
          : 0;

        // Calculate account age in days
        const createdAt = new Date(userData.created_at);
        const now = new Date();
        const accountAgeDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

        setGithubStats({
          repos: userData.public_repos || 0,
          stars: totalStars,
          followers: userData.followers || 0,
          accountAge: accountAgeDays,
        });
      } catch (error) {
        console.error('Failed to fetch GitHub stats:', error);
        // Fallback values
        setGithubStats({
          repos: 15,
          stars: 0,
          followers: 0,
          accountAge: 365,
        });
      }
    }

    fetchGitHubStats();
  }, []);

  const stats = [
    { label: 'REPOSITORIES', value: githubStats.repos, maxValue: 50, color: '#a855f7' },
    { label: 'TOTAL STARS', value: githubStats.stars, maxValue: 100, color: '#f59e0b' },
    { label: 'FOLLOWERS', value: githubStats.followers, maxValue: 100, color: '#06b6d4' },
    { label: 'ACCOUNT AGE', value: githubStats.accountAge, maxValue: 1000, color: '#10b981', suffix: ' days' },
  ];

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Hologram container */}
      <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-neon-cyan/30 overflow-hidden flex-1 flex flex-col">
        {/* Animated background grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, #06b6d4 1px, transparent 1px),
              linear-gradient(to bottom, #06b6d4 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Scanning line effect */}
        <motion.div
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-cyan to-transparent"
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        {/* Header */}
        <div className="relative z-10 mb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h3 className="font-mono text-xl font-bold text-neon-cyan mb-1 tracking-wider">
              DEVELOPER_STATS
            </h3>
            <p className="font-mono text-xs text-gray-400">
              @adabana-saki | SYSTEM ONLINE
            </p>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="relative z-10">
          {stats.map((stat, index) => (
            <StatItem
              key={stat.label}
              label={stat.label}
              value={stat.value}
              maxValue={stat.maxValue}
              color={stat.color}
              delay={0.2 + index * 0.15}
            />
          ))}
        </div>

        {/* Footer status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="relative z-10 mt-6 pt-4 border-t border-neon-cyan/20"
        >
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-green-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-green-400">ACTIVE</span>
            </div>
            <span className="text-gray-500">
              LAST_UPDATE: {new Date().toLocaleDateString()}
            </span>
          </div>
        </motion.div>

        {/* Corner decorations */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-neon-cyan/50" />
        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-neon-cyan/50" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-neon-cyan/50" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-neon-cyan/50" />

        {/* Scanlines overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6, 182, 212, 0.5) 2px, rgba(6, 182, 212, 0.5) 4px)',
          }}
        />

        {/* Glitch effect on hover */}
        <motion.div
          className="absolute inset-0 bg-neon-cyan/5 pointer-events-none"
          animate={{
            opacity: [0, 0.1, 0, 0.05, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 5,
          }}
        />
      </div>
    </div>
  );
}
