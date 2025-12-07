import { v4 as uuidv4 } from 'uuid';
import { WordSet, createDefaultStats } from './types';

export const demoSets: Omit<WordSet, 'id' | 'createdAt' | 'updatedAt' | 'stats'>[] = [
  {
    title: 'Korean Basics 🇰🇷',
    description: 'Essential Korean vocabulary for beginners',
    words: [
      { id: uuidv4(), term: '사과', definition: 'apple' },
      { id: uuidv4(), term: '오렌지', definition: 'orange' },
      { id: uuidv4(), term: '공부하다', definition: 'to study' },
      { id: uuidv4(), term: '학교', definition: 'school' },
      { id: uuidv4(), term: '선생님', definition: 'teacher' },
      { id: uuidv4(), term: '학생', definition: 'student' },
      { id: uuidv4(), term: '책', definition: 'book' },
      { id: uuidv4(), term: '물', definition: 'water' },
      { id: uuidv4(), term: '밥', definition: 'rice/meal' },
      { id: uuidv4(), term: '집', definition: 'house/home' },
      { id: uuidv4(), term: '친구', definition: 'friend' },
      { id: uuidv4(), term: '가족', definition: 'family' },
    ],
  },
  {
    title: 'GRE Vocabulary 📚',
    description: 'Advanced English vocabulary for GRE preparation',
    words: [
      { id: uuidv4(), term: 'Ubiquitous', definition: 'present, appearing, or found everywhere' },
      { id: uuidv4(), term: 'Ephemeral', definition: 'lasting for a very short time' },
      { id: uuidv4(), term: 'Pragmatic', definition: 'dealing with things sensibly and realistically' },
      { id: uuidv4(), term: 'Enigmatic', definition: 'difficult to interpret or understand; mysterious' },
      { id: uuidv4(), term: 'Pedantic', definition: 'excessively concerned with minor details' },
      { id: uuidv4(), term: 'Perfunctory', definition: 'carried out with minimum effort; cursory' },
      { id: uuidv4(), term: 'Sycophant', definition: 'a person who acts obsequiously to gain advantage' },
      { id: uuidv4(), term: 'Anachronism', definition: 'a thing belonging to a period other than that in which it exists' },
      { id: uuidv4(), term: 'Laconic', definition: 'using very few words' },
      { id: uuidv4(), term: 'Mellifluous', definition: 'sweet or musical; pleasant to hear' },
    ],
  },
  {
    title: 'JLPT N5 🇯🇵',
    description: 'Japanese vocabulary for JLPT N5 level',
    words: [
      { id: uuidv4(), term: '食べる (たべる)', definition: 'to eat' },
      { id: uuidv4(), term: '飲む (のむ)', definition: 'to drink' },
      { id: uuidv4(), term: '行く (いく)', definition: 'to go' },
      { id: uuidv4(), term: '来る (くる)', definition: 'to come' },
      { id: uuidv4(), term: '見る (みる)', definition: 'to see/watch' },
      { id: uuidv4(), term: '聞く (きく)', definition: 'to hear/listen/ask' },
      { id: uuidv4(), term: '話す (はなす)', definition: 'to speak' },
      { id: uuidv4(), term: '読む (よむ)', definition: 'to read' },
      { id: uuidv4(), term: '書く (かく)', definition: 'to write' },
      { id: uuidv4(), term: '分かる (わかる)', definition: 'to understand' },
      { id: uuidv4(), term: '大きい (おおきい)', definition: 'big, large' },
      { id: uuidv4(), term: '小さい (ちいさい)', definition: 'small, little' },
    ],
  },
  {
    title: 'Spanish Essentials 🇪🇸',
    description: 'Common Spanish words and phrases',
    words: [
      { id: uuidv4(), term: 'Hola', definition: 'Hello' },
      { id: uuidv4(), term: 'Gracias', definition: 'Thank you' },
      { id: uuidv4(), term: 'Por favor', definition: 'Please' },
      { id: uuidv4(), term: 'Buenos días', definition: 'Good morning' },
      { id: uuidv4(), term: 'Buenas noches', definition: 'Good night' },
      { id: uuidv4(), term: 'Adiós', definition: 'Goodbye' },
      { id: uuidv4(), term: 'Sí', definition: 'Yes' },
      { id: uuidv4(), term: 'No', definition: 'No' },
      { id: uuidv4(), term: '¿Cómo estás?', definition: 'How are you?' },
      { id: uuidv4(), term: 'Muy bien', definition: 'Very well' },
    ],
  },
];

export function createDemoSet(template: typeof demoSets[0]): WordSet {
  const now = Date.now();
  return {
    ...template,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
    stats: createDefaultStats(),
  };
}

export function getAllDemoSets(): WordSet[] {
  return demoSets.map(createDemoSet);
}

