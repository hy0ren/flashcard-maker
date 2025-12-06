'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { WordSet } from '@/lib/types';
import { loadSet, updateSetStats } from '@/lib/storage';
import MatchingGrid from '@/components/MatchingGrid';

interface MatchingPageProps {
  params: Promise<{ id: string }>;
}

export default function MatchingPage({ params }: MatchingPageProps) {
  const { id } = use(params);
  const [set, setSet] = useState<WordSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [lastTime, setLastTime] = useState(0);
  
  useEffect(() => {
    const loadedSet = loadSet(id);
    if (loadedSet) {
      // Filter out paused words
      const activeWords = loadedSet.words.filter(w => !w.paused);
      setSet({ ...loadedSet, words: activeWords });
    }
    setLoading(false);
  }, [id]);
  
  const handleComplete = (score: number, totalTime: number) => {
    updateSetStats(id, 'matching', score, set?.words.length || 0, totalTime);
    setLastTime(totalTime);
    setIsComplete(true);
  };
  
  const handleRestart = () => {
    setKey(prev => prev + 1);
    setIsComplete(false);
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
  
  if (set.words.length < 4) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Not Enough Words</h1>
        <p className="text-[var(--muted)] mb-6">
          Matching requires at least 4 words. This set has only {set.words.length}.
        </p>
        <Link href={`/sets/${id}`} className="btn btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Back to Set
        </Link>
      </div>
    );
  }
  
  // Limit to max 8 words for matching
  const wordsToUse = set.words.slice(0, 8);
  
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
          <div>
            <h1 className="text-2xl font-bold">Matching Quiz</h1>
            <p className="text-[var(--muted)]">Match terms with their definitions</p>
          </div>
          
          {isComplete && (
            <button onClick={handleRestart} className="btn btn-primary">
              <RotateCcw className="w-4 h-4" />
              Play Again
            </button>
          )}
        </div>
      </motion.div>
      
      {/* Game */}
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <MatchingGrid 
          words={wordsToUse}
          setId={id}
          onComplete={handleComplete}
          onRestart={handleRestart}
        />
      </motion.div>
      
      {/* Best Time */}
      {set.stats.matchingBestTime && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center text-sm text-[var(--muted)]"
        >
          Best time: {Math.floor(set.stats.matchingBestTime / 60)}:{(set.stats.matchingBestTime % 60).toString().padStart(2, '0')}
        </motion.div>
      )}
    </div>
  );
}

