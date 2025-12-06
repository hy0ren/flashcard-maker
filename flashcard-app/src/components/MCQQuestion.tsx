'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WordEntry } from '@/lib/types';
import { shuffleArray, getRandomItems } from '@/lib/parseWords';
import { Check, X, ArrowRight, RotateCcw, Infinity, RefreshCw } from 'lucide-react';

interface MCQQuestionProps {
  words: WordEntry[];
  onComplete: (score: number, total: number) => void;
}

interface Question {
  word: WordEntry;
  options: string[];
  correctIndex: number;
}

export default function MCQQuestion({ words, onComplete }: MCQQuestionProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<{ correct: boolean; question: Question; selected: number }[]>([]);
  
  // New mode toggles
  const [infiniteMode, setInfiniteMode] = useState(false);
  const [retryMissed, setRetryMissed] = useState(false);
  const [missedQuestions, setMissedQuestions] = useState<Question[]>([]);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [isRetryPhase, setIsRetryPhase] = useState(false);
  
  // Use refs to track current values for callbacks
  const scoreRef = useRef(0);
  const totalAnsweredRef = useRef(0);
  
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  
  useEffect(() => {
    totalAnsweredRef.current = totalAnswered;
  }, [totalAnswered]);
  
  const createQuestionForWord = useCallback((word: WordEntry): Question => {
    const wrongAnswers = getRandomItems(
      words,
      3,
      [word],
      (a, b) => a.id === b.id
    ).map(w => w.definition);
    
    const options = shuffleArray([word.definition, ...wrongAnswers]);
    const correctIndex = options.indexOf(word.definition);
    
    return { word, options, correctIndex };
  }, [words]);
  
  useEffect(() => {
    generateQuestions();
  }, [words]);
  
  const generateQuestions = () => {
    const shuffled = shuffleArray(words);
    const newQuestions: Question[] = shuffled.map(word => createQuestionForWord(word));
    
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setAnswers([]);
    setMissedQuestions([]);
    setTotalAnswered(0);
    setIsRetryPhase(false);
  };
  
  const addNextInfiniteQuestion = () => {
    // Pick a random word and create a new question
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const newQuestion = createQuestionForWord(randomWord);
    setQuestions(prev => [...prev, newQuestion]);
  };
  
  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    const isCorrect = index === questions[currentIndex].correctIndex;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    } else if (retryMissed && !isRetryPhase) {
      // Add to missed questions for later retry
      setMissedQuestions(prev => [...prev, questions[currentIndex]]);
    }
    
    setTotalAnswered(prev => prev + 1);
    
    setAnswers(prev => [...prev, {
      correct: isCorrect,
      question: questions[currentIndex],
      selected: index,
    }]);
    
    // Auto-advance after delay
    setTimeout(() => {
      if (infiniteMode) {
        // In infinite mode, always add a new question and continue
        addNextInfiniteQuestion();
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
      } else if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
      } else if (retryMissed && missedQuestions.length > 0 && !isRetryPhase) {
        // Start retry phase with missed questions
        const retryQuestions = missedQuestions.map(q => createQuestionForWord(q.word));
        setQuestions(retryQuestions);
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setMissedQuestions([]);
        setIsRetryPhase(true);
      } else {
        setShowResult(true);
        // Use the updated values: score was already incremented if correct
        onComplete(scoreRef.current, totalAnsweredRef.current);
      }
    }, 1500);
  };
  
  const handleEndInfinite = () => {
    setShowResult(true);
    onComplete(scoreRef.current, totalAnsweredRef.current);
  };
  
  if (questions.length === 0) {
    return <div className="text-center py-12">Loading...</div>;
  }
  
  const currentQuestion = questions[currentIndex];
  const progress = infiniteMode ? 100 : ((currentIndex) / questions.length) * 100;
  
  return (
    <div className="max-w-2xl mx-auto">
      {/* Mode Toggles */}
      {!showResult && currentIndex === 0 && selectedAnswer === null && !isRetryPhase && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]"
        >
          <div className="flex flex-wrap items-center gap-4">
            {/* Infinite Mode Toggle */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={infiniteMode}
                  onChange={(e) => setInfiniteMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--muted-light)] rounded-full peer peer-checked:bg-[var(--primary)] transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <Infinity className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--primary)]" />
                <span className="text-sm font-medium">Infinite Mode</span>
              </div>
            </label>
            
            {/* Retry Missed Toggle */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={retryMissed}
                  onChange={(e) => setRetryMissed(e.target.checked)}
                  disabled={infiniteMode}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${infiniteMode ? 'bg-[var(--muted-light)] opacity-50' : 'bg-[var(--muted-light)] peer-checked:bg-[var(--accent)]'}`} />
                <div className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5 ${infiniteMode ? 'opacity-50' : ''}`} />
              </div>
              <div className={`flex items-center gap-1.5 ${infiniteMode ? 'opacity-50' : ''}`}>
                <RefreshCw className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--accent)]" />
                <span className="text-sm font-medium">Retry Missed</span>
              </div>
            </label>
          </div>
          
          {infiniteMode && (
            <p className="text-xs text-[var(--muted)] mt-2">
              Questions will keep coming until you end the quiz.
            </p>
          )}
          {retryMissed && !infiniteMode && (
            <p className="text-xs text-[var(--muted)] mt-2">
              Missed questions will be asked again before the quiz ends.
            </p>
          )}
        </motion.div>
      )}
      
      <AnimatePresence mode="wait">
        {!showResult ? (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Retry Phase Banner */}
            {isRetryPhase && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-[var(--warning-light)] border border-[var(--warning)]/30 text-center"
              >
                <span className="text-sm font-medium text-[var(--warning)]">
                  🔄 Retry Phase: Answer the questions you missed
                </span>
              </motion.div>
            )}
            
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-[var(--muted)]">
                {infiniteMode ? (
                  <>
                    <span>Question {totalAnswered + 1}</span>
                    <span>Score: {score} / {totalAnswered}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {isRetryPhase ? 'Retry ' : ''}Question {currentIndex + 1} of {questions.length}
                    </span>
                    <span>Score: {score}</span>
                  </>
                )}
              </div>
              {!infiniteMode && (
                <div className="progress-bar">
                  <motion.div 
                    className="progress-bar-fill"
                    initial={{ width: `${progress}%` }}
                    animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              )}
              {infiniteMode && (
                <div className="h-2 rounded-full bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--primary)] animate-pulse" />
              )}
            </div>
            
            {/* Question */}
            <div className="card text-center py-8">
              <span className="badge badge-primary mb-4">What does this mean?</span>
              <h2 className="text-3xl md:text-4xl font-bold">{currentQuestion.word.term}</h2>
            </div>
            
            {/* Options */}
            <div className="grid gap-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctIndex;
                const showFeedback = selectedAnswer !== null;
                
                let className = 'w-full p-5 rounded-xl text-left font-medium transition-all border-2 ';
                
                if (!showFeedback) {
                  className += 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)] hover:shadow-md cursor-pointer';
                } else if (isCorrect) {
                  className += 'bg-[var(--success-light)] border-[var(--success)] text-[var(--success)]';
                } else if (isSelected && !isCorrect) {
                  className += 'bg-[var(--danger-light)] border-[var(--danger)] text-[var(--danger)] animate-shake';
                } else {
                  className += 'bg-[var(--card)] border-[var(--border)] opacity-50';
                }
                
                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={className}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        showFeedback && isCorrect 
                          ? 'bg-[var(--success)] text-white'
                          : showFeedback && isSelected
                            ? 'bg-[var(--danger)] text-white'
                            : 'bg-[var(--card-hover)] text-[var(--muted)]'
                      }`}>
                        {showFeedback ? (
                          isCorrect ? <Check className="w-4 h-4" /> : isSelected ? <X className="w-4 h-4" /> : String.fromCharCode(65 + index)
                        ) : (
                          String.fromCharCode(65 + index)
                        )}
                      </div>
                      <span className="flex-1">{option}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
            
            {/* End Quiz Button for Infinite Mode */}
            {infiniteMode && totalAnswered > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center pt-4"
              >
                <button
                  onClick={handleEndInfinite}
                  disabled={selectedAnswer !== null}
                  className="btn btn-secondary"
                >
                  End Quiz ({totalAnswered} answered)
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Score Card */}
            <div className="card text-center py-12">
              {(() => {
                const total = totalAnswered || questions.length;
                const percentage = Math.round((score / total) * 100);
                const isExcellent = percentage >= 80;
                const isGood = percentage >= 50;
                
                return (
                  <>
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                      isExcellent
                        ? 'bg-[var(--success-light)]' 
                        : isGood
                          ? 'bg-[var(--warning-light)]'
                          : 'bg-[var(--danger-light)]'
                    }`}>
                      {isExcellent ? (
                        <Check className="w-12 h-12 text-[var(--success)]" />
                      ) : (
                        <span className="text-4xl font-bold">{percentage}%</span>
                      )}
                    </div>
                    
                    <h2 className="text-3xl font-bold mb-2">
                      {isExcellent
                        ? 'Excellent!' 
                        : isGood
                          ? 'Good Job!'
                          : 'Keep Practicing!'}
                    </h2>
                    
                    <p className="text-[var(--muted)] text-lg mb-6">
                      You got {score} out of {total} correct
                      {infiniteMode && <span className="block text-sm mt-1">(Infinite Mode)</span>}
                    </p>
                  </>
                );
              })()}
              
              <button onClick={generateQuestions} className="btn btn-primary">
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
            </div>
            
            {/* Review */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Review Answers</h3>
              {answers.map((answer, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border-2 ${
                    answer.correct 
                      ? 'border-[var(--success)] bg-[var(--success-light)]' 
                      : 'border-[var(--danger)] bg-[var(--danger-light)]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      answer.correct ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'
                    }`}>
                      {answer.correct ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : (
                        <X className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{answer.question.word.term}</p>
                      {!answer.correct && (
                        <p className="text-sm text-[var(--danger)] line-through">
                          Your answer: {answer.question.options[answer.selected]}
                        </p>
                      )}
                      <p className={`text-sm ${answer.correct ? 'text-[var(--success)]' : 'text-[var(--muted)]'}`}>
                        Correct: {answer.question.word.definition}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

