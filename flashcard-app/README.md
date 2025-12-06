# FlashCards - Learn Smarter 📚

A modern flashcard web application built with Next.js, TypeScript, and Tailwind CSS. Create word sets, practice with flashcards, quizzes, and fun games!

## ✨ Features

### Core Features
- **Word Input & Set Creation** - Paste or type word-meaning pairs with auto-parsing
- **Flashcards Mode** - Flip cards with smooth animations, track "Known" vs "Still Learning"
- **Matching Quiz** - Connect terms with definitions, timed with best score tracking
- **Multiple Choice Quiz** - Select correct definitions with instant feedback

### Mini-Games
- **Speed Match** - 60-second rapid-fire matching with combo multipliers
- **Typing Practice** - Type the term from the definition, tracks accuracy

### Data Management
- **Local Storage** - All data persists in your browser
- **Import/Export** - Backup and share your sets as JSON
- **Demo Sets** - Pre-loaded Korean, Japanese (JLPT N5), GRE, and Spanish vocabulary

### UI/UX
- Beautiful, responsive design with Tailwind CSS
- Smooth animations with Framer Motion
- Dark mode support (follows system preference)
- Stats dashboard with performance tracking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Navigate to the flashcard-app directory
cd flashcard-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout with navbar
│   ├── page.tsx             # Dashboard home page
│   ├── stats/page.tsx       # Statistics page
│   └── sets/
│       ├── new/page.tsx     # Create new set
│       └── [id]/
│           ├── page.tsx     # Set detail & practice selector
│           ├── edit/page.tsx
│           └── practice/
│               ├── flashcards/page.tsx
│               ├── matching/page.tsx
│               ├── mcq/page.tsx
│               └── games/page.tsx
├── components/
│   ├── Navbar.tsx           # Navigation bar
│   ├── Flashcard.tsx        # Flip card component
│   ├── MatchingGrid.tsx     # Matching game grid
│   ├── MCQQuestion.tsx      # Multiple choice component
│   ├── GameSpeedMatch.tsx   # Speed match game
│   ├── GameTyping.tsx       # Typing practice game
│   ├── WordSetEditor.tsx    # Word pair editor
│   ├── SetCard.tsx          # Set preview card
│   └── PracticeSelector.tsx # Practice mode picker
└── lib/
    ├── types.ts             # TypeScript interfaces
    ├── storage.ts           # LocalStorage utilities
    ├── parseWords.ts        # Word parsing & helpers
    └── demoData.ts          # Demo vocabulary sets
```

## 📝 Word Input Formats

The app supports multiple input formats:

```
term: definition
term - definition
term = definition
term	definition (tab-separated)
```

### Example Input
```
사과: apple
오렌지: orange
공부하다: to study
```

## 🎮 Practice Modes

| Mode | Description | Min Words |
|------|-------------|-----------|
| Flashcards | Flip cards, mark known/learning | 1 |
| Matching | Connect terms to definitions | 4 |
| Multiple Choice | Select correct answer from 4 options | 4 |
| Speed Match | 60s timed matching with combos | 4 |
| Typing | Type term from definition | 1 |

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Storage**: Browser LocalStorage

## 📊 Statistics Tracked

- Total practice sessions per set
- Flashcard mastery percentage
- MCQ accuracy (running average)
- Matching best time
- Speed Match high score
- Typing best WPM
- Last practiced date

## 🎨 Customization

### Theming
The app uses CSS custom properties for theming. Modify `src/app/globals.css` to customize:

- Colors (primary, accent, success, danger, etc.)
- Shadows
- Gradients
- Border radius
- Animations

### Dark Mode
Dark mode automatically follows your system preference. Custom variables are defined for both light and dark themes.

## 📦 Demo Data

Load demo sets with one click from the dashboard:
- **Korean Basics** 🇰🇷 - 12 essential words
- **GRE Vocabulary** 📚 - 10 advanced English words
- **JLPT N5** 🇯🇵 - 12 basic Japanese verbs/adjectives
- **Spanish Essentials** 🇪🇸 - 10 common phrases

## 🔧 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📄 License

MIT License - feel free to use and modify for your own projects!

---

Built with ❤️ using Next.js and Tailwind CSS
