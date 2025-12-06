'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { WordSet } from '@/lib/types';
import { BookOpen, Clock, Trash2, Edit2, Play, ChevronRight, Sparkles } from 'lucide-react';

interface SetCardProps {
  set: WordSet;
  index: number;
  onDelete: (id: string) => void;
}

export default function SetCard({ set, index, onDelete }: SetCardProps) {
  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Never practiced';
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Practiced today';
    if (diffDays === 1) return 'Practiced yesterday';
    if (diffDays < 7) return `Practiced ${diffDays} days ago`;
    
    return `Practiced ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Delete "${set.title}"? This cannot be undone.`)) {
      onDelete(set.id);
    }
  };

  // Calculate mastery level
  const mastery = set.stats.mcqAccuracy || 0;
  const masteryColor = mastery >= 80 ? 'var(--success)' : mastery >= 50 ? 'var(--warning)' : 'var(--muted)';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group"
    >
      <div className="card card-interactive card-elevated h-full flex flex-col overflow-hidden">
        {/* Color accent bar */}
        <div 
          className="h-1 -mx-6 -mt-6 mb-5"
          style={{ 
            background: `linear-gradient(90deg, var(--primary), var(--accent))`,
          }}
        />
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg truncate group-hover:text-[var(--primary)] transition-colors">
                {set.title}
              </h3>
              {set.stats.totalPractices > 5 && (
                <Sparkles className="w-4 h-4 text-[var(--warning)] flex-shrink-0" />
              )}
            </div>
            {set.description && (
              <p className="text-sm text-[var(--muted)] line-clamp-2">
                {set.description}
              </p>
            )}
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Link
              href={`/sets/${set.id}/edit`}
              className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Edit2 className="w-4 h-4" />
            </Link>
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-light)] transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <div>
              <span className="font-semibold">{set.words.length}</span>
              <span className="text-[var(--muted)] ml-1">words</span>
            </div>
          </div>
          
          <div className="w-px h-6 bg-[var(--border)]" />
          
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <Clock className="w-4 h-4" />
            <span>{formatDate(set.stats.lastPracticed)}</span>
          </div>
        </div>
        
        {/* Mastery Progress */}
        {set.stats.totalPractices > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[var(--muted)] font-medium uppercase tracking-wide">Mastery</span>
              <span className="font-semibold" style={{ color: masteryColor }}>{mastery}%</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--background-secondary)] overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${mastery}%` }}
                transition={{ delay: index * 0.05 + 0.3, duration: 0.6 }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${masteryColor}, ${masteryColor}88)` }}
              />
            </div>
          </div>
        )}
        
        {/* Word Preview Tags */}
        <div className="flex flex-wrap gap-2 mb-5 flex-1">
          {set.words.slice(0, 3).map((word) => (
            <span 
              key={word.id} 
              className="text-xs px-3 py-1.5 rounded-lg bg-[var(--background-secondary)] text-[var(--muted)] font-medium border border-[var(--border)]"
            >
              {word.term}
            </span>
          ))}
          {set.words.length > 3 && (
            <span className="text-xs px-3 py-1.5 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] font-semibold">
              +{set.words.length - 3} more
            </span>
          )}
        </div>
        
        {/* Action Button */}
        <Link
          href={`/sets/${set.id}`}
          className="btn btn-primary w-full mt-auto group/btn"
        >
          <Play className="w-4 h-4" />
          Practice Now
          <ChevronRight className="w-4 h-4 opacity-0 -ml-2 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all" />
        </Link>
      </div>
    </motion.div>
  );
}
