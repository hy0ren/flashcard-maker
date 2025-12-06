'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { WordEntry, WordSet } from '@/lib/types';
import { loadSet, saveSet } from '@/lib/storage';
import { validateEntries } from '@/lib/parseWords';
import WordSetEditor from '@/components/WordSetEditor';

interface EditSetPageProps {
  params: Promise<{ id: string }>;
}

export default function EditSetPage({ params }: EditSetPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [set, setSet] = useState<WordSet | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [words, setWords] = useState<WordEntry[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadedSet = loadSet(id);
    if (loadedSet) {
      setSet(loadedSet);
      setTitle(loadedSet.title);
      setDescription(loadedSet.description || '');
      setWords(loadedSet.words);
    }
    setLoading(false);
  }, [id]);
  
  const handleSave = () => {
    if (!set) return;
    
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
    
    const updatedSet: WordSet = {
      ...set,
      title: title.trim(),
      description: description.trim() || undefined,
      words,
      updatedAt: Date.now(),
    };
    
    saveSet(updatedSet);
    router.push(`/sets/${id}`);
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
        <p className="text-[var(--muted)] mb-6">This flashcard set doesn&apos;t exist or has been deleted.</p>
        <Link href="/" className="btn btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
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
          Back to Set
        </Link>
        
        <h1 className="text-3xl font-bold">Edit Set</h1>
        <p className="text-[var(--muted)] mt-2">
          Update your flashcard set
        </p>
      </motion.div>
      
      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        {/* Title & Description */}
        <div className="card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Set Title <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="e.g., Korean Basics, GRE Vocabulary..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-[var(--muted)]">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              placeholder="Brief description of this set..."
            />
          </div>
        </div>
        
        {/* Words Editor */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Words</h2>
          <WordSetEditor 
            initialWords={words}
            onChange={setWords}
          />
        </div>
        
        {/* Errors */}
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 rounded-xl bg-[var(--danger-light)] border border-[var(--danger)]"
          >
            <h3 className="font-semibold text-[var(--danger)] mb-2">Please fix the following:</h3>
            <ul className="list-disc list-inside text-sm text-[var(--danger)]">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </motion.div>
        )}
        
        {/* Save Button */}
        <div className="flex items-center justify-end gap-4">
          <Link href={`/sets/${id}`} className="btn btn-ghost">
            Cancel
          </Link>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

