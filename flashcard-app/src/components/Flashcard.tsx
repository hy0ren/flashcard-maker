'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Sparkles } from 'lucide-react';

interface FlashcardProps {
  term: string;
  definition: string;
  showDefinitionFirst?: boolean;
  onFlip?: (isFlipped: boolean) => void;
}

export default function Flashcard({ 
  term, 
  definition, 
  showDefinitionFirst = false,
  onFlip 
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const handleFlip = () => {
    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);
    onFlip?.(newFlipped);
  };
  
  const frontContent = showDefinitionFirst ? definition : term;
  const backContent = showDefinitionFirst ? term : definition;
  const frontLabel = showDefinitionFirst ? 'Definition' : 'Term';
  const backLabel = showDefinitionFirst ? 'Term' : 'Definition';
  
  return (
    <div 
      className="w-full max-w-2xl mx-auto aspect-[4/3] cursor-pointer perspective-1200"
      onClick={handleFlip}
    >
      <motion.div
        className="relative w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div 
          className="absolute inset-0 backface-hidden rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xl flex flex-col overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Gradient accent */}
          <div className="h-2 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]" />
          
          {/* Decorative pattern */}
          <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
          
          <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
            <span className="absolute top-6 left-6 badge badge-muted text-xs">
              {frontLabel}
            </span>
            
            <motion.span 
              className="absolute top-6 right-6 text-[var(--muted)] flex items-center gap-1.5 text-sm"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <RotateCcw className="w-4 h-4" />
              Tap to flip
            </motion.span>
            
            <p className="text-4xl md:text-5xl font-bold text-center leading-tight tracking-tight">
              {frontContent}
            </p>
          </div>
          
          {/* Bottom decoration */}
          <div className="h-16 bg-gradient-to-t from-[var(--background-secondary)]/50 to-transparent" />
        </div>
        
        {/* Back */}
        <div 
          className="absolute inset-0 backface-hidden rounded-3xl overflow-hidden shadow-xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-[var(--primary-dark)] to-[var(--accent)]" />
          
          {/* Decorative elements */}
          <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full bg-white/10 blur-xl" />
          
          <div className="relative h-full flex flex-col items-center justify-center p-8 text-white">
            <span className="absolute top-6 left-6 px-3 py-1.5 rounded-full bg-white/20 text-white/90 text-xs font-semibold backdrop-blur-sm">
              {backLabel}
            </span>
            
            <span className="absolute top-6 right-6 flex items-center gap-1.5 text-white/70 text-sm">
              <Sparkles className="w-4 h-4" />
              Answer
            </span>
            
            <p className="text-3xl md:text-4xl font-semibold text-center leading-relaxed">
              {backContent}
            </p>
            
            <span className="absolute bottom-6 text-sm text-white/60">
              Tap to flip back
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
