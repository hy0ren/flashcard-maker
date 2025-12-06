'use client';

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { WordEntry } from '@/lib/types';
import { parseWords, entriesToText } from '@/lib/parseWords';
import { Trash2, GripVertical, Plus, FileText, Edit3, Pause, Play } from 'lucide-react';

interface WordSetEditorProps {
  initialWords?: WordEntry[];
  onChange: (words: WordEntry[]) => void;
}

export default function WordSetEditor({ initialWords = [], onChange }: WordSetEditorProps) {
  const [mode, setMode] = useState<'list' | 'bulk'>('list');
  const [words, setWords] = useState<WordEntry[]>(initialWords);
  const [bulkText, setBulkText] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);
  
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
  
  const handleTogglePaused = (index: number) => {
    const updated = [...words];
    updated[index] = { ...updated[index], paused: !updated[index].paused };
    setWords(updated);
    onChange(updated);
  };
  
  const handleBulkParse = () => {
    const parsed = parseWords(bulkText);
    setWords(parsed);
    onChange(parsed);
    setMode('list');
  };
  
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    dragNodeRef.current = e.target as HTMLDivElement;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    
    // Add a slight delay to apply dragging styles
    setTimeout(() => {
      if (dragNodeRef.current) {
        dragNodeRef.current.style.opacity = '0.5';
      }
    }, 0);
  };
  
  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear if we're leaving the element entirely
    const relatedTarget = e.relatedTarget as Node;
    if (!e.currentTarget.contains(relatedTarget)) {
      setDragOverIndex(null);
    }
  };
  
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }
    
    const updated = [...words];
    const [removed] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, removed);
    setWords(updated);
    onChange(updated);
    setDragOverIndex(null);
  };
  
  const handleDragEnd = () => {
    if (dragNodeRef.current) {
      dragNodeRef.current.style.opacity = '1';
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragNodeRef.current = null;
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
              <div className="grid grid-cols-[40px_1fr_1fr_40px_40px] gap-3 px-2 text-sm font-medium text-[var(--muted)]">
                <div></div>
                <div>Term</div>
                <div>Definition</div>
                <div className="text-center text-xs">Pause</div>
                <div></div>
              </div>
              
              {/* Word List */}
              {words.map((word, index) => (
                <div
                  key={word.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`grid grid-cols-[40px_1fr_1fr_40px_40px] gap-3 items-center p-2 rounded-xl border-2 transition-all animate-fadeIn ${
                    word.paused 
                      ? 'bg-[var(--muted-light)]/50 opacity-60' 
                      : 'bg-[var(--card)]'
                  } ${
                    draggedIndex === index 
                      ? 'opacity-50 scale-[0.98] border-[var(--border)]' 
                      : dragOverIndex === index 
                        ? 'border-[var(--primary)] bg-[var(--primary-light)] shadow-md' 
                        : 'border-[var(--border)]'
                  }`}
                  style={{ animationDelay: `${index * 0.02}s` }}
                >
                  <div className="flex justify-center cursor-grab active:cursor-grabbing text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  <input
                    type="text"
                    value={word.term}
                    onChange={(e) => handleWordChange(index, 'term', e.target.value)}
                    className={`input py-2 ${word.paused ? 'line-through text-[var(--muted)]' : ''}`}
                    placeholder="Term"
                  />
                  
                  <input
                    type="text"
                    value={word.definition}
                    onChange={(e) => handleWordChange(index, 'definition', e.target.value)}
                    className={`input py-2 ${word.paused ? 'line-through text-[var(--muted)]' : ''}`}
                    placeholder="Definition"
                  />
                  
                  <button
                    onClick={() => handleTogglePaused(index)}
                    className={`p-2 rounded-lg transition-colors ${
                      word.paused 
                        ? 'text-[var(--warning)] bg-[var(--warning-light)] hover:bg-[var(--warning)]/20' 
                        : 'text-[var(--muted)] hover:text-[var(--warning)] hover:bg-[var(--warning-light)]'
                    }`}
                    title={word.paused ? 'Resume word' : 'Pause word from practice'}
                  >
                    {word.paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </button>
                  
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
          {words.filter(w => w.paused).length > 0 && (
            <span className="ml-2 text-[var(--warning)]">
              ({words.filter(w => w.paused).length} paused)
            </span>
          )}
        </div>
      )}
    </div>
  );
}

