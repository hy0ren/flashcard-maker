'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { WordEntry } from '@/lib/types';
import { shuffleArray } from '@/lib/parseWords';
import { Check, X, Clock, RotateCcw, ArrowRight } from 'lucide-react';

interface MatchingGridProps {
  words: WordEntry[];
  setId: string;
  onComplete: (score: number, totalTime: number) => void;
  onRestart: () => void;
}

interface MatchItem {
  id: string;
  text: string;
  type: 'term' | 'definition';
  wordId: string;
  matched: boolean;
}

export default function MatchingGrid({ words, setId, onComplete, onRestart }: MatchingGridProps) {
  const [terms, setTerms] = useState<MatchItem[]>([]);
  const [definitions, setDefinitions] = useState<MatchItem[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<MatchItem | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<MatchItem | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [wrongMatch, setWrongMatch] = useState<{ termId: string; defId: string } | null>(null);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    const shuffledTerms: MatchItem[] = shuffleArray(words).map(w => ({
      id: `term-${w.id}`,
      text: w.term,
      type: 'term',
      wordId: w.id,
      matched: false,
    }));
    
    const shuffledDefs: MatchItem[] = shuffleArray(words).map(w => ({
      id: `def-${w.id}`,
      text: w.definition,
      type: 'definition',
      wordId: w.id,
      matched: false,
    }));
    
    setTerms(shuffledTerms);
    setDefinitions(shuffledDefs);
  }, [words]);
  
  useEffect(() => {
    if (isComplete) return;
    
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 100);
    
    return () => clearInterval(interval);
  }, [startTime, isComplete]);
  
  useEffect(() => {
    if (selectedTerm && selectedDefinition) {
      const isMatch = selectedTerm.wordId === selectedDefinition.wordId;
      
      if (isMatch) {
        // Correct match
        setMatchedPairs(prev => new Set([...prev, selectedTerm.wordId]));
        setScore(prev => prev + 1);
        
        setTerms(prev => prev.map(t => 
          t.id === selectedTerm.id ? { ...t, matched: true } : t
        ));
        setDefinitions(prev => prev.map(d => 
          d.id === selectedDefinition.id ? { ...d, matched: true } : d
        ));
        
        // Check completion
        if (matchedPairs.size + 1 === words.length) {
          setIsComplete(true);
          const totalTime = Math.floor((Date.now() - startTime) / 1000);
          onComplete(score + 1, totalTime);
        }
      } else {
        // Wrong match - show feedback
        setWrongMatch({ termId: selectedTerm.id, defId: selectedDefinition.id });
        setTimeout(() => setWrongMatch(null), 500);
      }
      
      // Reset selections
      setTimeout(() => {
        setSelectedTerm(null);
        setSelectedDefinition(null);
      }, 300);
    }
  }, [selectedTerm, selectedDefinition]);
  
  const handleTermClick = (item: MatchItem) => {
    if (item.matched) return;
    setSelectedTerm(selectedTerm?.id === item.id ? null : item);
  };
  
  const handleDefinitionClick = (item: MatchItem) => {
    if (item.matched) return;
    setSelectedDefinition(selectedDefinition?.id === item.id ? null : item);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <Clock className="w-5 h-5" />
            <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
          </div>
          <div className="badge badge-primary">
            {matchedPairs.size} / {words.length} matched
          </div>
        </div>
        
        <div className="text-sm text-[var(--muted)]">
          Click a term, then click its matching definition
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="progress-bar">
        <motion.div 
          className="progress-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${(matchedPairs.size / words.length) * 100}%` }}
        />
      </div>
      
      {/* Grid */}
      <div className="grid grid-cols-2 gap-8">
        {/* Terms Column */}
        <div className="space-y-3">
          <h3 className="font-semibold text-[var(--muted)] text-sm uppercase tracking-wide mb-4">
            Terms
          </h3>
          <AnimatePresence>
            {terms.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => handleTermClick(item)}
                disabled={item.matched}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: item.matched ? 0.5 : 1, 
                  x: 0,
                  scale: wrongMatch?.termId === item.id ? [1, 0.95, 1.05, 1] : 1,
                }}
                transition={{ delay: index * 0.05 }}
                className={`
                  w-full p-4 rounded-xl text-left font-medium transition-all
                  ${item.matched 
                    ? 'bg-[var(--success-light)] text-[var(--success)] cursor-default' 
                    : selectedTerm?.id === item.id
                      ? 'bg-[var(--primary)] text-white shadow-lg scale-[1.02]'
                      : wrongMatch?.termId === item.id
                        ? 'bg-[var(--danger-light)] text-[var(--danger)] animate-shake'
                        : 'bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-md'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {item.matched && <Check className="w-4 h-4 text-[var(--success)]" />}
                  <span>{item.text}</span>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Definitions Column */}
        <div className="space-y-3">
          <h3 className="font-semibold text-[var(--muted)] text-sm uppercase tracking-wide mb-4">
            Definitions
          </h3>
          <AnimatePresence>
            {definitions.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => handleDefinitionClick(item)}
                disabled={item.matched}
                initial={{ opacity: 0, x: 20 }}
                animate={{ 
                  opacity: item.matched ? 0.5 : 1, 
                  x: 0,
                  scale: wrongMatch?.defId === item.id ? [1, 0.95, 1.05, 1] : 1,
                }}
                transition={{ delay: index * 0.05 }}
                className={`
                  w-full p-4 rounded-xl text-left transition-all
                  ${item.matched 
                    ? 'bg-[var(--success-light)] text-[var(--success)] cursor-default' 
                    : selectedDefinition?.id === item.id
                      ? 'bg-[var(--accent)] text-white shadow-lg scale-[1.02]'
                      : wrongMatch?.defId === item.id
                        ? 'bg-[var(--danger-light)] text-[var(--danger)] animate-shake'
                        : 'bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)] hover:shadow-md'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {item.matched && <Check className="w-4 h-4 text-[var(--success)]" />}
                  <span>{item.text}</span>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Completion Message */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-[var(--card)] rounded-3xl p-8 text-center max-w-md mx-4 shadow-xl"
            >
              <div className="w-16 h-16 rounded-full bg-[var(--success-light)] flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-[var(--success)]" />
              </div>
              <h2 className="text-2xl font-bold mb-2">All Matched!</h2>
              <p className="text-[var(--muted)] mb-4">
                You completed the matching in {formatTime(elapsedTime)}
              </p>
              <div className="text-3xl font-bold text-[var(--primary)] mb-6">
                {words.length} / {words.length}
              </div>
              
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={onRestart}
                  className="btn btn-secondary"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>
                <Link
                  href={`/sets/${setId}`}
                  className="btn btn-primary"
                >
                  Back to Set
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

