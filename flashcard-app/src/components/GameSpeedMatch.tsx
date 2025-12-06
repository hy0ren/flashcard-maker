'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WordEntry } from '@/lib/types';
import { shuffleArray } from '@/lib/parseWords';
import { Timer, Zap, Check, X, Trophy, Flame } from 'lucide-react';

interface GameSpeedMatchProps {
  words: WordEntry[];
  onComplete: (score: number) => void;
}

export default function GameSpeedMatch({ words, onComplete }: GameSpeedMatchProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready');
  const [currentWord, setCurrentWord] = useState<WordEntry | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [combo, setCombo] = useState(1);
  const scoreRef = useRef(0);
  
  // Keep scoreRef in sync with score
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  
  const generateQuestion = useCallback((previousWordId?: string) => {
    // Filter out the previous word to avoid repetition
    const availableWords = previousWordId 
      ? words.filter(w => w.id !== previousWordId)
      : words;
    
    // If we only have 1 word total, we have to use it
    const wordsToShuffle = availableWords.length > 0 ? availableWords : words;
    const shuffled = shuffleArray(wordsToShuffle);
    const word = shuffled[0];
    
    const wrongAnswers = shuffleArray(words)
      .filter(w => w.id !== word.id)
      .slice(0, 3)
      .map(w => w.definition);
    
    const allOptions = shuffleArray([word.definition, ...wrongAnswers]);
    
    setCurrentWord(word);
    setOptions(allOptions);
  }, [words]);
  
  useEffect(() => {
    if (gameState === 'playing') {
      generateQuestion();
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('ended');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [gameState, generateQuestion]);
  
  // Call onComplete when game ends with the current score
  useEffect(() => {
    if (gameState === 'ended') {
      onComplete(scoreRef.current);
    }
  }, [gameState, onComplete]);
  
  const handleAnswer = (answer: string) => {
    if (!currentWord || gameState !== 'playing') return;
    
    const isCorrect = answer === currentWord.definition;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    if (isCorrect) {
      const points = 10 * combo;
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setCombo(prev => Math.min(prev + 0.5, 5));
    } else {
      setStreak(0);
      setCombo(1);
    }
    
    setTimeout(() => {
      setFeedback(null);
      generateQuestion(currentWord.id);
    }, 300);
  };
  
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setStreak(0);
    setCombo(1);
    setTimeLeft(60);
  };
  
  const getTimerColor = () => {
    if (timeLeft > 30) return 'text-[var(--success)]';
    if (timeLeft > 10) return 'text-[var(--warning)]';
    return 'text-[var(--danger)]';
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {gameState === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-16"
          >
            {/* Animated icon */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-8 shadow-xl"
            >
              <Zap className="w-14 h-14 text-white" />
            </motion.div>
            
            <h2 className="text-4xl font-bold mb-4">
              <span className="font-serif italic">Speed</span> Match
            </h2>
            <p className="text-lg text-[var(--muted)] max-w-md mx-auto mb-10">
              Match terms to definitions as fast as you can! Build combos for bonus points.
            </p>
            
            {/* Stats preview */}
            <div className="flex justify-center gap-8 mb-10">
              {[
                { value: words.length, label: 'Words', color: 'var(--primary)' },
                { value: '60s', label: 'Time Limit', color: 'var(--warning)' },
                { value: '5x', label: 'Max Combo', color: 'var(--accent)' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-xs text-[var(--muted)] uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <button onClick={startGame} className="btn btn-primary text-lg px-10 py-4">
              <Zap className="w-5 h-5" />
              Start Game
            </button>
          </motion.div>
        )}
        
        {gameState === 'playing' && currentWord && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
              <div className="flex items-center gap-4">
                <motion.div 
                  className={`flex items-center gap-2 text-3xl font-bold font-mono ${getTimerColor()}`}
                  animate={{ scale: timeLeft <= 10 ? [1, 1.05, 1] : 1 }}
                  transition={{ repeat: timeLeft <= 10 ? Infinity : 0, duration: 0.5 }}
                >
                  <Timer className="w-7 h-7" />
                  {timeLeft}
                </motion.div>
                
                {streak >= 3 && (
                  <motion.div 
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold"
                  >
                    <Flame className="w-4 h-4" />
                    {streak} streak!
                  </motion.div>
                )}
              </div>
              
              <div className="text-right">
                <div className="text-4xl font-bold">{score}</div>
                <div className="text-xs text-[var(--muted)] uppercase tracking-wide">
                  {combo > 1 && <span className="text-[var(--primary)] font-bold">{combo.toFixed(1)}x combo</span>}
                </div>
              </div>
            </div>
            
            {/* Time progress */}
            <div className="h-2 rounded-full bg-[var(--background-secondary)] overflow-hidden">
              <motion.div 
                className="h-full rounded-full"
                style={{ 
                  width: `${(timeLeft / 60) * 100}%`,
                  background: timeLeft > 30 ? 'var(--success)' : timeLeft > 10 ? 'var(--warning)' : 'var(--danger)'
                }}
                transition={{ duration: 0.1 }}
              />
            </div>
            
            {/* Question Card */}
            <motion.div 
              key={currentWord.id}
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`card py-12 text-center relative overflow-hidden ${
                feedback === 'correct' 
                  ? 'bg-[var(--success-light)] border-[var(--success)]' 
                  : feedback === 'wrong'
                    ? 'bg-[var(--danger-light)] border-[var(--danger)]'
                    : ''
              }`}
            >
              {/* Background decoration */}
              <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
              
              <span className="badge badge-primary mb-4">What does this mean?</span>
              <h2 className="text-4xl md:text-5xl font-bold relative">{currentWord.term}</h2>
              
              {feedback && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4"
                >
                  {feedback === 'correct' ? (
                    <div className="w-10 h-10 rounded-full bg-[var(--success)] flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--danger)] flex items-center justify-center">
                      <X className="w-5 h-5 text-white" />
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
            
            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {options.map((option, index) => (
                <motion.button
                  key={`${currentWord.id}-${index}`}
                  onClick={() => handleAnswer(option)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-5 rounded-xl bg-[var(--card)] border-2 border-[var(--border)] hover:border-[var(--primary)] hover:shadow-lg text-left font-medium transition-all"
                >
                  {option}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        
        {gameState === 'ended' && (
          <motion.div
            key="ended"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.6, repeat: 2 }}
              className="w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-8 shadow-xl"
            >
              <Trophy className="w-14 h-14 text-white" />
            </motion.div>
            
            <h2 className="text-4xl font-bold mb-3">
              <span className="font-serif italic">Time&apos;s</span> Up!
            </h2>
            <p className="text-lg text-[var(--muted)] mb-8">Great effort! Here&apos;s your score:</p>
            
            <motion.div 
              className="text-7xl font-bold text-gradient mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              {score}
            </motion.div>
            
            <div className="flex justify-center gap-10 mb-10">
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.floor(score / 10)}</div>
                <div className="text-sm text-[var(--muted)]">Correct</div>
              </div>
              <div className="w-px bg-[var(--border)]" />
              <div className="text-center">
                <div className="text-2xl font-bold">{streak}</div>
                <div className="text-sm text-[var(--muted)]">Best Streak</div>
              </div>
            </div>
            
            <button onClick={startGame} className="btn btn-primary text-lg px-10">
              <Zap className="w-5 h-5" />
              Play Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
