export interface WordEntry {
  id: string;
  term: string;
  definition: string;
  paused?: boolean;
}

export interface WordSet {
  id: string;
  title: string;
  description?: string;
  words: WordEntry[];
  createdAt: number;
  updatedAt: number;
  stats: SetStats;
}

export interface SetStats {
  totalPractices: number;
  flashcardAccuracy: number;
  matchingBestTime: number | null;
  mcqAccuracy: number;
  speedMatchHighScore: number;
  typingBestWPM: number;
  lastPracticed: number | null;
}

export interface PracticeResult {
  mode: 'flashcard' | 'matching' | 'mcq' | 'speed-match' | 'typing';
  score: number;
  totalQuestions: number;
  timeSpent: number;
  timestamp: number;
}

export const createDefaultStats = (): SetStats => ({
  totalPractices: 0,
  flashcardAccuracy: 0,
  matchingBestTime: null,
  mcqAccuracy: 0,
  speedMatchHighScore: 0,
  typingBestWPM: 0,
  lastPracticed: null,
});

