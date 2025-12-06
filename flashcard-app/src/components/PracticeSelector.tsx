'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Layers, Grid3X3, ListChecks, Gamepad2, Keyboard, Zap, ChevronRight, Lock } from 'lucide-react';

interface PracticeSelectorProps {
  setId: string;
  wordCount: number;
}

const practiceModesBase = [
  {
    id: 'flashcards',
    title: 'Flashcards',
    description: 'Classic flip cards to test your memory',
    icon: Layers,
    gradient: 'from-orange-500 to-rose-500',
    bgLight: 'bg-orange-50 dark:bg-orange-950/30',
    minWords: 1,
  },
  {
    id: 'matching',
    title: 'Matching',
    description: 'Connect terms with their definitions',
    icon: Grid3X3,
    gradient: 'from-blue-500 to-cyan-500',
    bgLight: 'bg-blue-50 dark:bg-blue-950/30',
    minWords: 4,
  },
  {
    id: 'mcq',
    title: 'Multiple Choice',
    description: 'Select the correct answer from options',
    icon: ListChecks,
    gradient: 'from-emerald-500 to-teal-500',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/30',
    minWords: 4,
  },
];

const games = [
  {
    id: 'speed-match',
    title: 'Speed Match',
    description: '60 seconds of rapid-fire matching with combo multipliers',
    icon: Zap,
    gradient: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50 dark:bg-amber-950/30',
    minWords: 4,
  },
  {
    id: 'typing',
    title: 'Typing Practice',
    description: 'Type the correct term from the definition shown',
    icon: Keyboard,
    gradient: 'from-violet-500 to-purple-500',
    bgLight: 'bg-violet-50 dark:bg-violet-950/30',
    minWords: 1,
  },
];

export default function PracticeSelector({ setId, wordCount }: PracticeSelectorProps) {
  return (
    <div className="space-y-10">
      {/* Study Modes */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] flex items-center justify-center">
            <Layers className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Study Modes</h2>
            <p className="text-sm text-[var(--muted)]">Traditional learning methods</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {practiceModesBase.map((mode, index) => {
            const Icon = mode.icon;
            const isDisabled = wordCount < mode.minWords;
            
            return (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {isDisabled ? (
                  <div className={`relative card h-full ${mode.bgLight} opacity-60`}>
                    <div className="absolute top-4 right-4">
                      <Lock className="w-4 h-4 text-[var(--muted)]" />
                    </div>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mode.gradient} flex items-center justify-center mb-4 opacity-50`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{mode.title}</h3>
                    <p className="text-sm text-[var(--muted)] mb-3">{mode.description}</p>
                    <p className="text-xs text-[var(--danger)] font-medium">
                      Requires at least {mode.minWords} words
                    </p>
                  </div>
                ) : (
                  <Link href={`/sets/${setId}/practice/${mode.id}`} className="block h-full group">
                    <div className={`relative card card-interactive h-full ${mode.bgLight} overflow-hidden`}>
                      {/* Hover gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                      
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mode.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="font-bold text-lg mb-1 group-hover:text-[var(--primary)] transition-colors">{mode.title}</h3>
                      <p className="text-sm text-[var(--muted)]">{mode.description}</p>
                      
                      <div className="flex items-center gap-1 mt-4 text-sm font-semibold text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                        Start learning
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Divider */}
      <div className="divider" />
      
      {/* Games */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Mini Games</h2>
            <p className="text-sm text-[var(--muted)]">Fun and interactive practice</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {games.map((game, index) => {
            const Icon = game.icon;
            const isDisabled = wordCount < game.minWords;
            
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + 3) * 0.1 }}
              >
                {isDisabled ? (
                  <div className={`relative card ${game.bgLight} opacity-60`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.gradient} flex items-center justify-center flex-shrink-0 opacity-50`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{game.title}</h3>
                          <Lock className="w-4 h-4 text-[var(--muted)]" />
                        </div>
                        <p className="text-sm text-[var(--muted)] mb-2">{game.description}</p>
                        <p className="text-xs text-[var(--danger)] font-medium">
                          Requires at least {game.minWords} words
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href={`/sets/${setId}/practice/games?mode=${game.id}`} className="block h-full group">
                    <div className={`relative card card-interactive h-full ${game.bgLight} overflow-hidden`}>
                      {/* Hover gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                      
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.gradient} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1 group-hover:text-[var(--primary)] transition-colors">{game.title}</h3>
                          <p className="text-sm text-[var(--muted)]">{game.description}</p>
                          
                          <div className="flex items-center gap-1 mt-3 text-sm font-semibold text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                            Play now
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
