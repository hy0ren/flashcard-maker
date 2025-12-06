'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WordEntry } from '@/lib/types';
import { shuffleArray } from '@/lib/parseWords';
import { Keyboard, Check, X, Trophy, SkipForward } from 'lucide-react';

interface GameTypingProps {
  words: WordEntry[];
  onComplete: (wpm: number, accuracy: number) => void;
}

export default function GameTyping({ words, onComplete }: GameTypingProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready');
  const [shuffledWords, setShuffledWords] = useState<WordEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [skipped, setSkipped] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (gameState === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, currentIndex]);
  
  const startGame = () => {
    setShuffledWords(shuffleArray(words));
    setCurrentIndex(0);
    setUserInput('');
    setCorrect(0);
    setIncorrect(0);
    setSkipped(0);
    setStartTime(Date.now());
    setGameState('playing');
    setFeedback(null);
  };
  
  const checkAnswer = () => {
    const currentWord = shuffledWords[currentIndex];
    const isCorrect = userInput.toLowerCase().trim() === currentWord.term.toLowerCase().trim();
    
    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    if (isCorrect) {
      setCorrect(prev => prev + 1);
    } else {
      setIncorrect(prev => prev + 1);
    }
    
    setTimeout(() => {
      nextWord();
    }, 1000);
  };
  
  const nextWord = () => {
    setFeedback(null);
    setUserInput('');
    
    if (currentIndex >= shuffledWords.length - 1) {
      endGame();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };
  
  const skipWord = () => {
    setSkipped(prev => prev + 1);
    nextWord();
  };
  
  const endGame = () => {
    const endTime = Date.now();
    const timeSpent = (endTime - (startTime || endTime)) / 1000 / 60; // minutes
    const totalAttempted = correct + incorrect;
    const wpm = totalAttempted > 0 ? Math.round(totalAttempted / timeSpent) : 0;
    const accuracy = totalAttempted > 0 ? Math.round((correct / totalAttempted) * 100) : 0;
    
    setGameState('ended');
    onComplete(wpm, accuracy);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userInput.trim()) {
      checkAnswer();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      skipWord();
    }
  };
  
  const currentWord = shuffledWords[currentIndex];
  const progress = shuffledWords.length > 0 ? ((currentIndex) / shuffledWords.length) * 100 : 0;
  
  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {gameState === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-16 space-y-8"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] flex items-center justify-center mx-auto">
              <Keyboard className="w-12 h-12 text-white" />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold mb-4">Typing Practice</h2>
              <p className="text-[var(--muted)] max-w-md mx-auto">
                See a definition, type the term. Test your recall and typing speed!
                Press Enter to check, Tab to skip.
              </p>
            </div>
            
            <div className="flex justify-center gap-8 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--primary)]">{words.length}</div>
                <div className="text-[var(--muted)]">Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--primary)]">Enter</div>
                <div className="text-[var(--muted)]">Submit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--primary)]">Tab</div>
                <div className="text-[var(--muted)]">Skip</div>
              </div>
            </div>
            
            <button onClick={startGame} className="btn btn-primary text-lg px-8 py-4">
              <Keyboard className="w-5 h-5" />
              Start Typing
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
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-[var(--muted)]">
                <span>Word {currentIndex + 1} of {shuffledWords.length}</span>
                <span className="flex gap-4">
                  <span className="text-[var(--success)]">✓ {correct}</span>
                  <span className="text-[var(--danger)]">✗ {incorrect}</span>
                  {skipped > 0 && <span className="text-[var(--muted)]">⏭ {skipped}</span>}
                </span>
              </div>
              <div className="progress-bar">
                <motion.div 
                  className="progress-bar-fill"
                  initial={{ width: `${progress}%` }}
                  animate={{ width: `${((currentIndex + 1) / shuffledWords.length) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Definition Card */}
            <motion.div 
              key={currentWord.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`card py-12 text-center transition-colors ${
                feedback === 'correct' 
                  ? 'bg-[var(--success-light)] border-[var(--success)]' 
                  : feedback === 'wrong'
                    ? 'bg-[var(--danger-light)] border-[var(--danger)]'
                    : ''
              }`}
            >
              <span className="badge badge-primary mb-4">Type the term for:</span>
              <p className="text-2xl md:text-3xl font-semibold">{currentWord.definition}</p>
              
              {feedback === 'wrong' && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-[var(--danger)]"
                >
                  Correct answer: <span className="font-bold">{currentWord.term}</span>
                </motion.p>
              )}
            </motion.div>
            
            {/* Input */}
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={feedback !== null}
                placeholder="Type your answer..."
                className={`input text-xl py-4 pr-24 font-mono ${
                  feedback === 'correct' 
                    ? 'border-[var(--success)] bg-[var(--success-light)]' 
                    : feedback === 'wrong'
                      ? 'border-[var(--danger)] bg-[var(--danger-light)]'
                      : ''
                }`}
                autoComplete="off"
                autoCapitalize="off"
              />
              
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                {feedback === null && (
                  <>
                    <button
                      onClick={skipWord}
                      className="p-2 rounded-lg text-[var(--muted)] hover:bg-[var(--card-hover)] transition-colors"
                      title="Skip (Tab)"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>
                    <button
                      onClick={checkAnswer}
                      disabled={!userInput.trim()}
                      className="btn btn-primary py-2 px-4 disabled:opacity-50"
                    >
                      Check
                    </button>
                  </>
                )}
                
                {feedback && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="p-2"
                  >
                    {feedback === 'correct' ? (
                      <Check className="w-6 h-6 text-[var(--success)]" />
                    ) : (
                      <X className="w-6 h-6 text-[var(--danger)]" />
                    )}
                  </motion.div>
                )}
              </div>
            </div>
            
            <p className="text-center text-sm text-[var(--muted)]">
              Press <kbd className="px-2 py-1 rounded bg-[var(--card-hover)] text-xs">Enter</kbd> to check 
              or <kbd className="px-2 py-1 rounded bg-[var(--card-hover)] text-xs">Tab</kbd> to skip
            </p>
          </motion.div>
        )}
        
        {gameState === 'ended' && (
          <motion.div
            key="ended"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 space-y-8"
          >
            <motion.div 
              className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] flex items-center justify-center mx-auto"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1, repeat: 2 }}
            >
              <Trophy className="w-12 h-12 text-white" />
            </motion.div>
            
            <div>
              <h2 className="text-3xl font-bold mb-2">Well Done!</h2>
              <p className="text-[var(--muted)]">Here are your results:</p>
            </div>
            
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="text-3xl font-bold text-[var(--success)]">{correct}</div>
                <div className="text-sm text-[var(--muted)]">Correct</div>
              </motion.div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-3xl font-bold text-[var(--danger)]">{incorrect}</div>
                <div className="text-sm text-[var(--muted)]">Incorrect</div>
              </motion.div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-3xl font-bold text-[var(--primary)]">
                  {correct + incorrect > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 0}%
                </div>
                <div className="text-sm text-[var(--muted)]">Accuracy</div>
              </motion.div>
            </div>
            
            <button onClick={startGame} className="btn btn-primary text-lg px-8">
              <Keyboard className="w-5 h-5" />
              Practice Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

