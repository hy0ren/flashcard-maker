'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { WordEntry } from '@/lib/types';
import { parseWords, entriesToText } from '@/lib/parseWords';
import { Trash2, GripVertical, Plus, FileText, Edit3 } from 'lucide-react';

interface WordSetEditorProps {
  initialWords?: WordEntry[];
  onChange: (words: WordEntry[]) => void;
}

export default function WordSetEditor({ initialWords = [], onChange }: WordSetEditorProps) {
  const [mode, setMode] = useState<'list' | 'bulk'>('list');
  const [words, setWords] = useState<WordEntry[]>(initialWords);
  const [bulkText, setBulkText] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  useEffect(() => {
    if (initialWords.length > 0 && words.length === 0) {
      setWords(initialWords);
      setBulkText(entriesToText(initialWords));
    }
  }, [initialWords]);
  
  const handleWordChange = (index: number, field: 'term' | 'definition', value: string) => {
    const updated = [...words];
    updated[index] = { ...updated[index], [field]: value };
    setWords(updated);
    onChange(updated);
  };
  
  const handleAddWord = () => {
    const newWord: WordEntry = { id: uuidv4(), term: '', definition: '' };
    const updated = [...words, newWord];
    setWords(updated);
    onChange(updated);
  };
  
  const handleDeleteWord = (index: number) => {
    const updated = words.filter((_, i) => i !== index);
    setWords(updated);
    onChange(updated);
  };
  
  const handleBulkParse = () => {
    const parsed = parseWords(bulkText);
    setWords(parsed);
    onChange(parsed);
    setMode('list');
  };
  
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const updated = [...words];
    const [removed] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, removed);
    setWords(updated);
    setDraggedIndex(index);
    onChange(updated);
  };
  
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };
  
  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-[var(--card-hover)] rounded-xl w-fit">
        <button
          onClick={() => setMode('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'list' 
              ? 'bg-[var(--card)] shadow-sm text-[var(--foreground)]' 
              : 'text-[var(--muted)] hover:text-[var(--foreground)]'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          List Editor
        </button>
        <button
          onClick={() => {
            setBulkText(entriesToText(words));
            setMode('bulk');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'bulk' 
              ? 'bg-[var(--card)] shadow-sm text-[var(--foreground)]' 
              : 'text-[var(--muted)] hover:text-[var(--foreground)]'
          }`}
        >
          <FileText className="w-4 h-4" />
          Bulk Import
        </button>
      </div>
      
      {mode === 'bulk' ? (
        <div className="space-y-4">
          <div className="text-sm text-[var(--muted)]">
            Paste your word pairs, one per line. Supported formats:
            <ul className="mt-1 ml-4 list-disc">
              <li><code className="text-[var(--primary)]">term: definition</code></li>
              <li><code className="text-[var(--primary)]">term - definition</code></li>
              <li><code className="text-[var(--primary)]">term = definition</code></li>
            </ul>
          </div>
          
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            className="textarea min-h-[300px] font-mono text-sm"
            placeholder="사과: apple
오렌지: orange
공부하다: to study"
          />
          
          <button
            onClick={handleBulkParse}
            className="btn btn-primary"
          >
            Parse & Preview
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {words.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-[var(--border)] rounded-2xl">
              <p className="text-[var(--muted)] mb-4">No words yet. Add your first word pair!</p>
              <button onClick={handleAddWord} className="btn btn-primary">
                <Plus className="w-4 h-4" />
                Add Word
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="grid grid-cols-[40px_1fr_1fr_40px] gap-3 px-2 text-sm font-medium text-[var(--muted)]">
                <div></div>
                <div>Term</div>
                <div>Definition</div>
                <div></div>
              </div>
              
              {/* Word List */}
              {words.map((word, index) => (
                <div
                  key={word.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`grid grid-cols-[40px_1fr_1fr_40px] gap-3 items-center p-2 rounded-xl bg-[var(--card)] border border-[var(--border)] transition-all animate-fadeIn ${
                    draggedIndex === index ? 'opacity-50 scale-[0.98]' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.02}s` }}
                >
                  <div className="flex justify-center cursor-grab active:cursor-grabbing text-[var(--muted)]">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  <input
                    type="text"
                    value={word.term}
                    onChange={(e) => handleWordChange(index, 'term', e.target.value)}
                    className="input py-2"
                    placeholder="Term"
                  />
                  
                  <input
                    type="text"
                    value={word.definition}
                    onChange={(e) => handleWordChange(index, 'definition', e.target.value)}
                    className="input py-2"
                    placeholder="Definition"
                  />
                  
                  <button
                    onClick={() => handleDeleteWord(index)}
                    className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-light)] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {/* Add Button */}
              <button
                onClick={handleAddWord}
                className="w-full py-3 border-2 border-dashed border-[var(--border)] rounded-xl text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Word
              </button>
            </>
          )}
        </div>
      )}
      
      {/* Word Count */}
      {words.length > 0 && (
        <div className="text-sm text-[var(--muted)] text-right">
          {words.length} word{words.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

