'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, ThumbsUp, ThumbsDown, Shuffle, RotateCcw, Settings } from 'lucide-react';
import { WordSet, WordEntry } from '@/lib/types';
import { loadSet, updateSetStats } from '@/lib/storage';
import { shuffleArray } from '@/lib/parseWords';
import Flashcard from '@/components/Flashcard';

interface FlashcardsPageProps {
  params: Promise<{ id: string }>;
}

export default function FlashcardsPage({ params }: FlashcardsPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [set, setSet] = useState<WordSet | null>(null);
  const [cards, setCards] = useState<WordEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [unknown, setUnknown] = useState<Set<string>>(new Set());
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDefinitionFirst, setShowDefinitionFirst] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadedSet = loadSet(id);
    if (loadedSet) {
      setSet(loadedSet);
      setCards(loadedSet.words);
    }
    setLoading(false);
  }, [id]);
  
  const shuffleCards = () => {
    setCards(shuffleArray(cards));
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnown(new Set());
    setUnknown(new Set());
    setIsComplete(false);
  };
  
  const restartSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnown(new Set());
    setUnknown(new Set());
    setIsComplete(false);
  };
  
  const handleKnown = () => {
    const currentCard = cards[currentIndex];
    setKnown(prev => new Set([...prev, currentCard.id]));
    goNext();
  };
  
  const handleUnknown = () => {
    const currentCard = cards[currentIndex];
    setUnknown(prev => new Set([...prev, currentCard.id]));
    goNext();
  };
  
  const goNext = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 200);
    } else {
      // Complete
      const score = known.size + (cards[currentIndex] ? 1 : 0);
      updateSetStats(id, 'flashcard', score, cards.length);
      setTimeout(() => setIsComplete(true), 200);
    }
  };
  
  const goPrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
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
  
  const currentCard = cards[currentIndex];
  const progress = ((currentIndex) / cards.length) * 100;
  
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
          <h1 className="text-2xl font-bold">Flashcards</h1>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDefinitionFirst(!showDefinitionFirst)}
              className="btn btn-ghost text-sm"
              title="Toggle card order"
            >
              <Settings className="w-4 h-4" />
              {showDefinitionFirst ? 'Definition → Term' : 'Term → Definition'}
            </button>
            <button onClick={shuffleCards} className="btn btn-ghost" title="Shuffle cards">
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
      
      <AnimatePresence mode="wait">
        {!isComplete ? (
          <motion.div
            key="cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-[var(--muted)]">
                <span>Card {currentIndex + 1} of {cards.length}</span>
                <span className="flex gap-4">
                  <span className="text-[var(--success)]">✓ {known.size} known</span>
                  <span className="text-[var(--danger)]">✗ {unknown.size} learning</span>
                </span>
              </div>
              <div className="progress-bar">
                <motion.div 
                  className="progress-bar-fill"
                  initial={{ width: `${progress}%` }}
                  animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Card */}
            {currentCard && (
              <Flashcard
                term={currentCard.term}
                definition={currentCard.definition}
                showDefinitionFirst={showDefinitionFirst}
                onFlip={setIsFlipped}
              />
            )}
            
            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="btn btn-ghost disabled:opacity-30"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
              
              <button
                onClick={handleUnknown}
                className="btn bg-[var(--danger-light)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white px-8"
              >
                <ThumbsDown className="w-5 h-5" />
                Still Learning
              </button>
              
              <button
                onClick={handleKnown}
                className="btn bg-[var(--success-light)] text-[var(--success)] hover:bg-[var(--success)] hover:text-white px-8"
              >
                <ThumbsUp className="w-5 h-5" />
                Got It!
              </button>
              
              <button
                onClick={goNext}
                disabled={currentIndex === cards.length - 1}
                className="btn btn-ghost disabled:opacity-30"
              >
                Skip
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-center text-sm text-[var(--muted)]">
              Click the card to flip it, then rate your knowledge
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              known.size >= cards.length * 0.8 
                ? 'bg-[var(--success-light)]' 
                : 'bg-[var(--warning-light)]'
            }`}>
              <span className="text-4xl">
                {known.size >= cards.length * 0.8 ? '🎉' : '💪'}
              </span>
            </div>
            
            <h2 className="text-3xl font-bold mb-4">Session Complete!</h2>
            
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--success)]">{known.size}</div>
                <div className="text-sm text-[var(--muted)]">Known</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--danger)]">{unknown.size}</div>
                <div className="text-sm text-[var(--muted)]">Still Learning</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--primary)]">
                  {Math.round((known.size / cards.length) * 100)}%
                </div>
                <div className="text-sm text-[var(--muted)]">Mastery</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <button onClick={restartSession} className="btn btn-secondary">
                <RotateCcw className="w-4 h-4" />
                Start Over
              </button>
              <Link href={`/sets/${id}`} className="btn btn-primary">
                Back to Set
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

