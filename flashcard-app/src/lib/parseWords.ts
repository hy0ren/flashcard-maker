import { v4 as uuidv4 } from 'uuid';
import { WordEntry } from './types';

/**
 * Parses raw text input into an array of WordEntry objects
 * Supports formats:
 * - "term: definition"
 * - "term - definition"
 * - "term = definition"
 * - "term\tdefinition" (tab separated)
 */
export function parseWords(rawText: string): WordEntry[] {
  const lines = rawText.split('\n').filter(line => line.trim() !== '');
  
  return lines.map(line => {
    let term = '';
    let definition = '';
    
    // Try different delimiters in order of priority
    const delimiters = [':', ' - ', '=', '\t'];
    
    for (const delimiter of delimiters) {
      const index = line.indexOf(delimiter);
      if (index !== -1) {
        term = line.substring(0, index).trim();
        definition = line.substring(index + delimiter.length).trim();
        break;
      }
    }
    
    // If no delimiter found, use the whole line as term
    if (!term && !definition) {
      term = line.trim();
      definition = '';
    }
    
    return {
      id: uuidv4(),
      term,
      definition,
    };
  }).filter(entry => entry.term !== '');
}

/**
 * Converts WordEntry array back to text format
 */
export function entriesToText(entries: WordEntry[]): string {
  return entries.map(entry => `${entry.term}: ${entry.definition}`).join('\n');
}

/**
 * Validates that entries have both term and definition
 */
export function validateEntries(entries: WordEntry[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  entries.forEach((entry, index) => {
    if (!entry.term.trim()) {
      errors.push(`Entry ${index + 1}: Term is empty`);
    }
    if (!entry.definition.trim()) {
      errors.push(`Entry ${index + 1}: Definition is empty for "${entry.term}"`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Gets random items from array excluding specified items
 */
export function getRandomItems<T>(
  array: T[],
  count: number,
  exclude: T[] = [],
  compareFn: (a: T, b: T) => boolean = (a, b) => a === b
): T[] {
  const filtered = array.filter(item => !exclude.some(ex => compareFn(item, ex)));
  const shuffled = shuffleArray(filtered);
  return shuffled.slice(0, count);
}

