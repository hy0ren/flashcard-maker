'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Sparkles, AlertCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { WordEntry, WordSet, createDefaultStats } from '@/lib/types';
import { saveSet } from '@/lib/storage';
import { validateEntries } from '@/lib/parseWords';
import WordSetEditor from '@/components/WordSetEditor';
import { Logo } from '@/components/Logo';

export default function NewSetPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [words, setWords] = useState<WordEntry[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const maxDescriptionWords = 200;

  const clampDescription = (value: string) => {
    const parts = value.trim().split(/\s+/).filter(Boolean);
    if (parts.length <= maxDescriptionWords) return value;
    return parts.slice(0, maxDescriptionWords).join(' ');
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = clampDescription(e.target.value);
    setDescription(next);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };
  
  const handleSave = () => {
    const validationErrors: string[] = [];
    
    if (!title.trim()) {
      validationErrors.push('Please enter a title for your set');
    }
    
    if (words.length === 0) {
      validationErrors.push('Please add at least one word');
    }
    
    const { valid, errors: wordErrors } = validateEntries(words);
    if (!valid) {
      validationErrors.push(...wordErrors);
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setSaving(true);
    
    const newSet: WordSet = {
      id: uuidv4(),
      title: title.trim(),
      description: description.trim() || undefined,
      words,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stats: createDefaultStats(),
    };
    
    saveSet(newSet);
    router.push(`/sets/${newSet.id}`);
  };

  const handleGenerateDescription = async () => {
    setAiError(null);

    if (words.length === 0) {
      setAiError('Add some words first so AI has something to describe.');
      return;
    }

    try {
      setGeneratingDescription(true);
      const res = await fetch('/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title || undefined,
          words: words.map(({ term, definition }) => ({ term, definition })),
        }),
      });

      const data = (await res.json()) as { description?: string; error?: string };

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate description.');
      }

      if (data.description) {
        const next = clampDescription(data.description);
        setDescription(next);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong with AI.';
      setAiError(message);
    } finally {
      setGeneratingDescription(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
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
        
        <div className="flex items-center gap-4">
          <Logo size={56} asLink={false} />
          <div>
            <h1 className="text-3xl font-bold">
              Create <span className="font-serif italic">New</span> Set
            </h1>
            <p className="text-[var(--muted)]">Add your vocabulary words and start learning</p>
          </div>
        </div>
      </motion.div>
      
      {/* Form */}
      <div className="space-y-6">
        {/* Title & Description Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="font-bold text-lg">Set Details</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Set Title <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="e.g., Korean Basics, GRE Vocabulary, Spanish Verbs..."
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <label className="block text-sm font-semibold">
                  Description{' '}
                  <span className="text-[var(--muted)] font-normal">(optional)</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={generatingDescription || words.length === 0}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-[var(--border)] bg-[var(--background-secondary)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--primary)]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-[var(--primary)]" />
                  {generatingDescription ? 'Generating…' : 'Generate with AI'}
                </button>
              </div>
              <textarea
                value={description}
                onChange={handleDescriptionChange}
                className="input min-h-[64px] resize-none leading-relaxed"
                placeholder="Brief description of what this set covers..."
                rows={2}
                style={{ height: 'auto' }}
              />
              {aiError && (
                <p className="mt-1 text-xs text-[var(--danger)] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {aiError}
                </p>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Words Editor Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--accent)]" />
              <h2 className="font-bold text-lg">Words</h2>
            </div>
            {words.length > 0 && (
              <span className="badge badge-accent">{words.length} words</span>
            )}
          </div>
          
          <WordSetEditor 
            initialWords={words}
            onChange={setWords}
          />
        </motion.div>
        
        {/* Errors */}
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-5 rounded-2xl bg-[var(--danger-light)] border border-[var(--danger)]/30"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--danger)]/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-[var(--danger)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--danger)] mb-2">Please fix the following:</h3>
                <ul className="list-disc list-inside text-sm text-[var(--danger)]/80 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-end gap-4 pt-4"
        >
          <Link href="/" className="btn btn-ghost">
            Cancel
          </Link>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Set'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
