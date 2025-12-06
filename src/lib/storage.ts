import { WordSet, SetStats, createDefaultStats } from './types';

const STORAGE_KEY = 'flashcard-sets';

/**
 * Gets all sets from localStorage
 */
export function listSets(): WordSet[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading sets:', error);
    return [];
  }
}

/**
 * Gets a single set by ID
 */
export function loadSet(id: string): WordSet | null {
  const sets = listSets();
  return sets.find(set => set.id === id) || null;
}

/**
 * Saves a set (creates new or updates existing)
 */
export function saveSet(set: WordSet): void {
  if (typeof window === 'undefined') return;
  
  const sets = listSets();
  const existingIndex = sets.findIndex(s => s.id === set.id);
  
  if (existingIndex !== -1) {
    sets[existingIndex] = { ...set, updatedAt: Date.now() };
  } else {
    sets.push(set);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
}

/**
 * Deletes a set by ID
 */
export function deleteSet(id: string): void {
  if (typeof window === 'undefined') return;
  
  const sets = listSets();
  const filtered = sets.filter(set => set.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Renames a set
 */
export function renameSet(id: string, newTitle: string): void {
  const set = loadSet(id);
  if (set) {
    set.title = newTitle;
    set.updatedAt = Date.now();
    saveSet(set);
  }
}

/**
 * Updates set stats after practice
 */
export function updateSetStats(
  id: string,
  mode: 'flashcard' | 'matching' | 'mcq' | 'speed-match' | 'typing',
  score: number,
  totalQuestions: number,
  timeSpent?: number
): void {
  const set = loadSet(id);
  if (!set) return;
  
  const accuracy = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
  
  set.stats.totalPractices += 1;
  set.stats.lastPracticed = Date.now();
  
  switch (mode) {
    case 'flashcard':
      // Running average for flashcard accuracy
      const prevFlashcard = set.stats.flashcardAccuracy || 0;
      set.stats.flashcardAccuracy = Math.round((prevFlashcard + accuracy) / 2);
      break;
    case 'matching':
      // Best time for matching
      if (timeSpent && (set.stats.matchingBestTime === null || timeSpent < set.stats.matchingBestTime)) {
        set.stats.matchingBestTime = timeSpent;
      }
      break;
    case 'mcq':
      // Store most recent MCQ accuracy
      set.stats.mcqAccuracy = Math.round(accuracy);
      break;
    case 'speed-match':
      // High score for speed match
      if (score > set.stats.speedMatchHighScore) {
        set.stats.speedMatchHighScore = score;
      }
      break;
    case 'typing':
      // Best WPM for typing
      if (score > set.stats.typingBestWPM) {
        set.stats.typingBestWPM = score;
      }
      break;
  }
  
  saveSet(set);
}

/**
 * Gets stats for a set
 */
export function getSetStats(id: string): SetStats | null {
  const set = loadSet(id);
  return set?.stats || null;
}

/**
 * Clears all data (for testing/reset)
 */
export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Exports all sets as JSON
 */
export function exportSets(): string {
  const sets = listSets();
  return JSON.stringify(sets, null, 2);
}

/**
 * Imports sets from JSON
 */
export function importSets(jsonData: string): { success: boolean; message: string } {
  try {
    const sets = JSON.parse(jsonData) as WordSet[];
    
    if (!Array.isArray(sets)) {
      return { success: false, message: 'Invalid format: expected an array' };
    }
    
    // Validate structure
    for (const set of sets) {
      if (!set.id || !set.title || !Array.isArray(set.words)) {
        return { success: false, message: 'Invalid set structure' };
      }
    }
    
    // Merge with existing sets
    const existingSets = listSets();
    const existingIds = new Set(existingSets.map(s => s.id));
    
    for (const set of sets) {
      if (!existingIds.has(set.id)) {
        existingSets.push(set);
      }
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingSets));
    return { success: true, message: `Imported ${sets.length} set(s)` };
  } catch (error) {
    return { success: false, message: 'Failed to parse JSON' };
  }
}

