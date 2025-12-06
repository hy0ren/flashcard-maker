'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  BarChart3, BookOpen, Target, Clock, Zap, Trophy,
  TrendingUp, Calendar, Award, ChevronRight
} from 'lucide-react';
import { WordSet } from '@/lib/types';
import { listSets } from '@/lib/storage';

export default function StatsPage() {
  const [sets, setSets] = useState<WordSet[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setSets(listSets());
    setLoading(false);
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl icon-container-primary animate-pulse-gentle">
            <BarChart3 className="w-6 h-6" />
          </div>
          <p className="text-[var(--muted)] font-medium">Loading stats...</p>
        </div>
      </div>
    );
  }
  
  // Calculate aggregate stats
  const totalSets = sets.length;
  const totalWords = sets.reduce((acc, set) => acc + set.words.length, 0);
  const totalPractices = sets.reduce((acc, set) => acc + set.stats.totalPractices, 0);
  
  const avgMcqAccuracy = sets.length > 0 
    ? Math.round(sets.reduce((acc, set) => acc + (set.stats.mcqAccuracy || 0), 0) / sets.length) 
    : 0;
  
  const avgFlashcardAccuracy = sets.length > 0
    ? Math.round(sets.reduce((acc, set) => acc + (set.stats.flashcardAccuracy || 0), 0) / sets.length)
    : 0;
  
  const bestSpeedMatchScore = Math.max(...sets.map(s => s.stats.speedMatchHighScore), 0);
  const bestTypingWPM = Math.max(...sets.map(s => s.stats.typingBestWPM), 0);
  
  const recentlyPracticed = sets
    .filter(s => s.stats.lastPracticed)
    .sort((a, b) => (b.stats.lastPracticed || 0) - (a.stats.lastPracticed || 0))
    .slice(0, 5);
  
  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl icon-container-primary">
            <BarChart3 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              Your <span className="font-serif italic">Statistics</span>
            </h1>
            <p className="text-[var(--muted)]">Track your learning progress</p>
          </div>
        </div>
      </motion.div>
      
      {sets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative text-center py-20 rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--background-secondary)]/50 overflow-hidden"
        >
          <div className="absolute inset-0 bg-dot-pattern opacity-50" />
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-[var(--muted-light)] flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10 text-[var(--muted)]" />
            </div>
            <h2 className="text-2xl font-bold mb-3">No Stats Yet</h2>
            <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">
              Create some flashcard sets and start practicing to see your statistics!
            </p>
            <Link href="/sets/new" className="btn btn-primary">
              Create Your First Set
            </Link>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Overview Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
          >
            {[
              { icon: BookOpen, value: totalSets, label: 'Total Sets', color: 'primary' },
              { icon: Target, value: totalWords, label: 'Words Learned', color: 'accent' },
              { icon: TrendingUp, value: totalPractices, label: 'Practice Sessions', color: 'success' },
              { icon: Award, value: `${avgMcqAccuracy}%`, label: 'Avg Quiz Score', color: 'warning' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              const bgColor = stat.color === 'primary' ? 'var(--primary-light)' : 
                             stat.color === 'accent' ? 'var(--accent-light)' : 
                             stat.color === 'success' ? 'var(--success-light)' : 'var(--warning-light)';
              const iconColor = stat.color === 'primary' ? 'var(--primary)' : 
                               stat.color === 'accent' ? 'var(--accent)' : 
                               stat.color === 'success' ? 'var(--success)' : 'var(--warning)';
              
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="stat-card"
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: bgColor }}
                  >
                    <Icon className="w-7 h-7" style={{ color: iconColor }} />
                  </div>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-[var(--muted)]">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Performance Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--warning-light)] flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-[var(--warning)]" />
                </div>
                <h2 className="font-bold text-lg">Performance</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Flashcard Mastery</span>
                    <span className="font-bold text-[var(--primary)]">{avgFlashcardAccuracy}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-[var(--background-secondary)] overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${avgFlashcardAccuracy}%` }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">MCQ Accuracy</span>
                    <span className="font-bold text-[var(--accent)]">{avgMcqAccuracy}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-[var(--background-secondary)] overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${avgMcqAccuracy}%` }}
                      transition={{ delay: 0.6, duration: 0.8 }}
                      className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--success)]"
                    />
                  </div>
                </div>
                
                <div className="divider !my-4" />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[var(--background-secondary)]">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-[var(--warning)]" />
                      <span className="text-sm text-[var(--muted)]">Speed Match</span>
                    </div>
                    <div className="text-2xl font-bold">{bestSpeedMatchScore}</div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-[var(--background-secondary)]">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-[var(--accent)]" />
                      <span className="text-sm text-[var(--muted)]">Best WPM</span>
                    </div>
                    <div className="text-2xl font-bold">{bestTypingWPM}</div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <h2 className="font-bold text-lg">Recent Activity</h2>
              </div>
              
              {recentlyPracticed.length > 0 ? (
                <div className="space-y-3">
                  {recentlyPracticed.map((set, index) => (
                    <motion.div
                      key={set.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                    >
                      <Link 
                        href={`/sets/${set.id}`}
                        className="flex items-center justify-between p-4 rounded-xl bg-[var(--background-secondary)] hover:bg-[var(--card-hover)] transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold text-sm">
                            {set.words.length}
                          </div>
                          <div>
                            <div className="font-semibold group-hover:text-[var(--primary)] transition-colors">{set.title}</div>
                            <div className="text-xs text-[var(--muted)]">
                              {set.stats.totalPractices} practices
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                          {formatDate(set.stats.lastPracticed)}
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-[var(--muted)]">No practice sessions yet</p>
                </div>
              )}
            </motion.div>
          </div>
          
          {/* All Sets Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card mt-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <h2 className="font-bold text-lg">All Sets Performance</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-4 px-3 font-semibold text-[var(--muted)]">Set</th>
                    <th className="text-center py-4 px-3 font-semibold text-[var(--muted)]">Words</th>
                    <th className="text-center py-4 px-3 font-semibold text-[var(--muted)]">Practices</th>
                    <th className="text-center py-4 px-3 font-semibold text-[var(--muted)]">MCQ %</th>
                    <th className="text-center py-4 px-3 font-semibold text-[var(--muted)]">Speed Score</th>
                    <th className="text-center py-4 px-3 font-semibold text-[var(--muted)]">Last Practiced</th>
                  </tr>
                </thead>
                <tbody>
                  {sets.map((set, index) => (
                    <motion.tr
                      key={set.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + 0.03 * index }}
                      className="border-b border-[var(--border)] hover:bg-[var(--background-secondary)] transition-colors"
                    >
                      <td className="py-4 px-3">
                        <Link 
                          href={`/sets/${set.id}`}
                          className="font-semibold hover:text-[var(--primary)] transition-colors"
                        >
                          {set.title}
                        </Link>
                      </td>
                      <td className="text-center py-4 px-3">{set.words.length}</td>
                      <td className="text-center py-4 px-3">{set.stats.totalPractices}</td>
                      <td className="text-center py-4 px-3">
                        <span className={`font-semibold ${
                          set.stats.mcqAccuracy >= 80 ? 'text-[var(--success)]' : 
                          set.stats.mcqAccuracy >= 50 ? 'text-[var(--warning)]' : 'text-[var(--muted)]'
                        }`}>
                          {set.stats.mcqAccuracy || '-'}%
                        </span>
                      </td>
                      <td className="text-center py-4 px-3 font-medium">
                        {set.stats.speedMatchHighScore || '-'}
                      </td>
                      <td className="text-center py-4 px-3 text-[var(--muted)]">
                        {formatDate(set.stats.lastPracticed)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
