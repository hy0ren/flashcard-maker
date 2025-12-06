'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { WordSet } from '@/lib/types';
import { loadSet, updateSetStats } from '@/lib/storage';
import MCQQuestion from '@/components/MCQQuestion';

interface MCQPageProps {
  params: Promise<{ id: string }>;
}

export default function MCQPage({ params }: MCQPageProps) {
  const { id } = use(params);
  const [set, setSet] = useState<WordSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(0);
  
  useEffect(() => {
    const loadedSet = loadSet(id);
    setSet(loadedSet);
    setLoading(false);
  }, [id]);
  
  const handleComplete = (score: number, total: number) => {
    updateSetStats(id, 'mcq', score, total);
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
          Multiple choice requires at least 4 words. This set has only {set.words.length}.
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
        
        <h1 className="text-2xl font-bold">Multiple Choice Quiz</h1>
        <p className="text-[var(--muted)]">Select the correct definition for each term</p>
      </motion.div>
      
      {/* Quiz */}
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <MCQQuestion 
          words={set.words} 
          onComplete={handleComplete}
        />
      </motion.div>
      
      {/* Stats */}
      {set.stats.mcqAccuracy > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center text-sm text-[var(--muted)]"
        >
          Average accuracy: {set.stats.mcqAccuracy}%
        </motion.div>
      )}
    </div>
  );
}

