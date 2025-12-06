'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WordEntry } from '@/lib/types';
import { shuffleArray, getRandomItems } from '@/lib/parseWords';
import { Check, X, ArrowRight, RotateCcw } from 'lucide-react';

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
  
  useEffect(() => {
    generateQuestions();
  }, [words]);
  
  const generateQuestions = () => {
    const shuffled = shuffleArray(words);
    const newQuestions: Question[] = shuffled.map(word => {
      // Get 3 random wrong answers
      const wrongAnswers = getRandomItems(
        words,
        3,
        [word],
        (a, b) => a.id === b.id
      ).map(w => w.definition);
      
      // Combine with correct answer and shuffle
      const options = shuffleArray([word.definition, ...wrongAnswers]);
      const correctIndex = options.indexOf(word.definition);
      
      return {
        word,
        options,
        correctIndex,
      };
    });
    
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setAnswers([]);
  };
  
  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    const isCorrect = index === questions[currentIndex].correctIndex;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setAnswers(prev => [...prev, {
      correct: isCorrect,
      question: questions[currentIndex],
      selected: index,
    }]);
    
    // Auto-advance after delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
        onComplete(isCorrect ? score + 1 : score, questions.length);
      }
    }, 1500);
  };
  
  if (questions.length === 0) {
    return <div className="text-center py-12">Loading...</div>;
  }
  
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;
  
  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!showResult ? (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-[var(--muted)]">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span>Score: {score}</span>
              </div>
              <div className="progress-bar">
                <motion.div 
                  className="progress-bar-fill"
                  initial={{ width: `${progress}%` }}
                  animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
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
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Score Card */}
            <div className="card text-center py-12">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                score >= questions.length * 0.8 
                  ? 'bg-[var(--success-light)]' 
                  : score >= questions.length * 0.5
                    ? 'bg-[var(--warning-light)]'
                    : 'bg-[var(--danger-light)]'
              }`}>
                {score >= questions.length * 0.8 ? (
                  <Check className="w-12 h-12 text-[var(--success)]" />
                ) : (
                  <span className="text-4xl font-bold">{Math.round((score / questions.length) * 100)}%</span>
                )}
              </div>
              
              <h2 className="text-3xl font-bold mb-2">
                {score >= questions.length * 0.8 
                  ? 'Excellent!' 
                  : score >= questions.length * 0.5
                    ? 'Good Job!'
                    : 'Keep Practicing!'}
              </h2>
              
              <p className="text-[var(--muted)] text-lg mb-6">
                You got {score} out of {questions.length} correct
              </p>
              
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

