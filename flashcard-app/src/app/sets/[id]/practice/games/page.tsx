'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Keyboard } from 'lucide-react';
import { WordSet } from '@/lib/types';
import { loadSet, updateSetStats } from '@/lib/storage';
import GameSpeedMatch from '@/components/GameSpeedMatch';
import GameTyping from '@/components/GameTyping';

interface GamesPageProps {
  params: Promise<{ id: string }>;
}

export default function GamesPage({ params }: GamesPageProps) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'speed-match';
  
  const [set, setSet] = useState<WordSet | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadedSet = loadSet(id);
    setSet(loadedSet);
    setLoading(false);
  }, [id]);
  
  const handleSpeedMatchComplete = (score: number) => {
    updateSetStats(id, 'speed-match', score, 0);
  };
  
  const handleTypingComplete = (wpm: number, accuracy: number) => {
    updateSetStats(id, 'typing', wpm, 100);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-[var(--muted)]">Loading...</div>
      </div>
    );
  }
  
  if (!set) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Set Not Found</h1>
        <Link href="/" className="btn btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }
  
  if (set.words.length < 4 && mode === 'speed-match') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Not Enough Words</h1>
        <p className="text-[var(--muted)] mb-6">
          Speed Match requires at least 4 words. This set has only {set.words.length}.
        </p>
        <Link href={`/sets/${id}`} className="btn btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Back to Set
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link 
          href={`/sets/${id}`}
          className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {set.title}
        </Link>
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {mode === 'speed-match' ? (
              <>
                <Zap className="w-6 h-6 text-[var(--warning)]" />
                Speed Match
              </>
            ) : (
              <>
                <Keyboard className="w-6 h-6 text-[var(--accent)]" />
                Typing Practice
              </>
            )}
          </h1>
          
          {/* Mode Switcher */}
          <div className="flex gap-2 p-1 bg-[var(--card-hover)] rounded-xl">
            <Link
              href={`/sets/${id}/practice/games?mode=speed-match`}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'speed-match'
                  ? 'bg-[var(--card)] shadow-sm text-[var(--foreground)]'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              <Zap className="w-4 h-4" />
              Speed
            </Link>
            <Link
              href={`/sets/${id}/practice/games?mode=typing`}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'typing'
                  ? 'bg-[var(--card)] shadow-sm text-[var(--foreground)]'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              Typing
            </Link>
          </div>
        </div>
      </motion.div>
      
      {/* Game */}
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {mode === 'speed-match' ? (
          <GameSpeedMatch 
            words={set.words} 
            onComplete={handleSpeedMatchComplete}
          />
        ) : (
          <GameTyping 
            words={set.words} 
            onComplete={handleTypingComplete}
          />
        )}
      </motion.div>
      
      {/* High Scores */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center text-sm text-[var(--muted)]"
      >
        {mode === 'speed-match' && set.stats.speedMatchHighScore > 0 && (
          <span>High Score: {set.stats.speedMatchHighScore} points</span>
        )}
        {mode === 'typing' && set.stats.typingBestWPM > 0 && (
          <span>Best WPM: {set.stats.typingBestWPM}</span>
        )}
      </motion.div>
    </div>
  );
}

