'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, BookOpen, Download, Upload, ArrowRight, Layers, Zap, Target } from 'lucide-react';
import { WordSet } from '@/lib/types';
import { listSets, deleteSet, saveSet, exportSets, importSets } from '@/lib/storage';
import { getAllDemoSets } from '@/lib/demoData';
import SetCard from '@/components/SetCard';

export default function Dashboard() {
  const [sets, setSets] = useState<WordSet[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadedSets = listSets();
    setSets(loadedSets);
    setLoading(false);
  }, []);
  
  const handleDelete = (id: string) => {
    deleteSet(id);
    setSets(listSets());
  };
  
  const handleLoadDemo = () => {
    const demoSets = getAllDemoSets();
    demoSets.forEach(set => saveSet(set));
    setSets(listSets());
  };
  
  const handleExport = () => {
    const data = exportSets();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcard-sets.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target?.result as string;
          const result = importSets(data);
          if (result.success) {
            setSets(listSets());
            alert(result.message);
          } else {
            alert(result.message);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl icon-container-primary animate-pulse-gentle">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-[var(--muted)] font-medium">Loading your sets...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 relative"
      >
        {/* Decorative rings */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="decoration-ring w-[300px] h-[300px] opacity-10" />
          <div className="decoration-ring w-[400px] h-[400px] opacity-5" />
        </div>
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary-light)] border border-[var(--primary)]/20 text-[var(--primary)] text-sm font-semibold mb-6"
        >
          <Sparkles className="w-4 h-4" />
          Learn vocabulary the smart way
        </motion.div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
          <span className="font-serif italic">Master</span> any{' '}
          <span className="text-gradient">vocabulary</span>
        </h1>
        
        <p className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
          Create flashcard sets, practice with interactive quizzes, and play games 
          designed to help you remember. All saved locally on your device.
        </p>
        
        {/* Quick Stats */}
        {sets.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-8 mt-10"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] flex items-center justify-center">
                <Layers className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold">{sets.length}</div>
                <div className="text-xs text-[var(--muted)] uppercase tracking-wide">Sets</div>
              </div>
            </div>
            <div className="w-px h-12 bg-[var(--border)]" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold">{sets.reduce((acc, set) => acc + set.words.length, 0)}</div>
                <div className="text-xs text-[var(--muted)] uppercase tracking-wide">Words</div>
              </div>
            </div>
            <div className="w-px h-12 bg-[var(--border)]" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--warning-light)] flex items-center justify-center">
                <Target className="w-5 h-5 text-[var(--warning)]" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold">{sets.reduce((acc, set) => acc + set.stats.totalPractices, 0)}</div>
                <div className="text-xs text-[var(--muted)] uppercase tracking-wide">Practices</div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {/* Actions Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap items-center justify-between gap-4 mb-10"
      >
        <div className="flex items-center gap-3">
          <Link href="/sets/new" className="btn btn-primary group">
            <Plus className="w-4 h-4" />
            Create New Set
            <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
          </Link>
          
          {sets.length === 0 && (
            <button onClick={handleLoadDemo} className="btn btn-secondary group">
              <Sparkles className="w-4 h-4 text-[var(--primary)]" />
              Load Demo Sets
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleImport} 
            className="btn btn-ghost text-sm"
            title="Import sets from JSON"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </button>
          {sets.length > 0 && (
            <button 
              onClick={handleExport} 
              className="btn btn-ghost text-sm"
              title="Export all sets to JSON"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
      </motion.div>
      
      {/* Empty State */}
      <AnimatePresence>
        {sets.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative text-center py-20 rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--background-secondary)]/50 overflow-hidden"
          >
            {/* Decorative background */}
            <div className="absolute inset-0 bg-dot-pattern opacity-50" />
            
            <div className="relative">
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 rounded-3xl icon-container-primary mx-auto mb-8"
              >
                <BookOpen className="w-12 h-12 text-white" />
              </motion.div>
              
              <h2 className="text-3xl font-bold mb-3">
                Start your <span className="font-serif italic">learning</span> journey
              </h2>
              <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">
                Create your first flashcard set or load demo vocabulary to explore all the features.
              </p>
              
              <div className="flex items-center justify-center gap-4">
                <Link href="/sets/new" className="btn btn-primary">
                  <Plus className="w-4 h-4" />
                  Create Set
                </Link>
                <button onClick={handleLoadDemo} className="btn btn-secondary">
                  <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                  Load Demo Data
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Sets Grid */}
      {sets.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-[var(--primary)]" />
              Your Sets
            </h2>
            <span className="badge badge-muted">{sets.length} total</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sets.map((set, index) => (
              <SetCard 
                key={set.id} 
                set={set} 
                index={index}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Feature Highlights */}
      {sets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { 
              icon: Layers, 
              title: 'Flashcards', 
              desc: 'Flip through cards and test your memory',
              color: 'primary'
            },
            { 
              icon: Target, 
              title: 'Quizzes', 
              desc: 'Multiple choice and matching challenges',
              color: 'accent'
            },
            { 
              icon: Zap, 
              title: 'Games', 
              desc: 'Speed match and typing practice',
              color: 'warning'
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            const bgColor = feature.color === 'primary' ? 'var(--primary-light)' : feature.color === 'accent' ? 'var(--accent-light)' : 'var(--warning-light)';
            const iconColor = feature.color === 'primary' ? 'var(--primary)' : feature.color === 'accent' ? 'var(--accent)' : 'var(--warning)';
            
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)]"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: bgColor }}
                >
                  <Icon className="w-6 h-6" style={{ color: iconColor }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-[var(--muted)]">{feature.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
