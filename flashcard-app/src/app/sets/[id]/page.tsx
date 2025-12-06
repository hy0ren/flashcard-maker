'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit2, Trash2, BookOpen, Clock, Target, Trophy, TrendingUp, Sparkles } from 'lucide-react';
import { WordSet } from '@/lib/types';
import { loadSet, deleteSet } from '@/lib/storage';
import PracticeSelector from '@/components/PracticeSelector';

interface SetDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function SetDetailPage({ params }: SetDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [set, setSet] = useState<WordSet | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadedSet = loadSet(id);
    setSet(loadedSet);
    setLoading(false);
  }, [id]);
  
  const handleDelete = () => {
    if (confirm(`Delete "${set?.title}"? This cannot be undone.`)) {
      deleteSet(id);
      router.push('/');
    }
  };
  
  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl icon-container-primary animate-pulse-gentle">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-[var(--muted)] font-medium">Loading set...</p>
        </div>
      </div>
    );
  }
  
  if (!set) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-20 h-20 rounded-3xl bg-[var(--danger-light)] flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-10 h-10 text-[var(--danger)]" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Set Not Found</h1>
        <p className="text-[var(--muted)] mb-8">This flashcard set doesn&apos;t exist or has been deleted.</p>
        <Link href="/" className="btn btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold">{set.title}</h1>
              {set.stats.totalPractices > 10 && (
                <Sparkles className="w-5 h-5 text-[var(--warning)]" />
              )}
            </div>
            {set.description && (
              <p className="text-[var(--muted)] text-lg">{set.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Link href={`/sets/${id}/edit`} className="btn btn-secondary">
              <Edit2 className="w-4 h-4" />
              Edit Set
            </Link>
            <button onClick={handleDelete} className="btn btn-ghost text-[var(--danger)]">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
      
      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
      >
        <div className="stat-card">
          <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <div className="text-3xl font-bold">{set.words.length}</div>
          <div className="text-sm text-[var(--muted)]">Words</div>
        </div>
        
        <div className="stat-card stat-card-accent">
          <div className="w-12 h-12 rounded-xl bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6 text-[var(--accent)]" />
          </div>
          <div className="text-3xl font-bold">{set.stats.totalPractices}</div>
          <div className="text-sm text-[var(--muted)]">Practices</div>
        </div>
        
        <div className="stat-card">
          <div className="w-12 h-12 rounded-xl bg-[var(--warning-light)] flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-[var(--warning)]" />
          </div>
          <div className="text-sm font-semibold">{formatDate(set.stats.lastPracticed)}</div>
          <div className="text-sm text-[var(--muted)]">Last Practiced</div>
        </div>
        
        <div className="stat-card stat-card-accent">
          <div className="w-12 h-12 rounded-xl bg-[var(--success-light)] flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-[var(--success)]" />
          </div>
          <div className="text-3xl font-bold text-[var(--success)]">
            {set.stats.mcqAccuracy || 0}%
          </div>
          <div className="text-sm text-[var(--muted)]">Accuracy</div>
        </div>
      </motion.div>
      
      {/* Word List Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card mb-10"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--primary)]" />
            Words in this set
          </h2>
          <span className="badge badge-muted">{set.words.length} words</span>
        </div>
        
        <div className="max-h-[350px] overflow-y-auto space-y-2 pr-2">
          {set.words.map((word, index) => (
            <motion.div
              key={word.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.02 * index }}
              className="flex items-center gap-4 p-4 rounded-xl bg-[var(--background-secondary)] hover:bg-[var(--card-hover)] transition-colors group"
            >
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                {index + 1}
              </span>
              <span className="font-semibold flex-1 truncate">{word.term}</span>
              <span className="w-px h-6 bg-[var(--border)]" />
              <span className="text-[var(--muted)] flex-1 truncate">{word.definition}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* Practice Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <PracticeSelector setId={id} wordCount={set.words.length} />
      </motion.div>
    </div>
  );
}
