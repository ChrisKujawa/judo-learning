# 🥋 Judo Learning App

A mobile-friendly web app for learning Judo techniques and theory for DJB Kyu grade exams.

The app UI and quiz content are in German. Japanese terms are used as prompts, and German meanings are used as answers.

**Live:** [chriskujawa.github.io/judo-learning](https://chriskujawa.github.io/judo-learning/)

---

## Features

- **8 Kyu grades** from white-yellow (8th Kyu) to brown (1st Kyu)
- **Multiple-choice quizzes** with mixed question types:
  - Japanese term to German meaning
  - Technique image to Japanese technique name
  - Judo value recognition
- **Cumulative technique pools:** higher grades include all techniques from earlier grades
- **Immediate feedback** after each answer, including teaching hints
- **Score summary** at the end of every quiz round with emoji feedback
- Installable as a mobile PWA with app-owned icons and standalone launch
- Offline-capable after the app has been opened once online

## Technique data

The content is based on the official DJB graduation system:

- Basic terms: Dojo, Judogi, Rei, and more
- Judo values: Jita Kyoei, Seiryoku Zenyo, and more
- Throwing techniques: Ashi-Waza, Te-Waza, Koshi-Waza, Sutemi-Waza
- Ground techniques: Osaekomi-Waza, Kansetsu-Waza, Shime-Waza
- Basic stances, breakfalls, and contest terms

---

## Local development

### Requirements

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/ChrisKujawa/judo-learning.git
cd judo-learning
npm install
npm run dev
```

The app then runs at `http://localhost:5173/judo-learning/`.

### PWA and offline use

The app includes a web app manifest, app-owned icons, and a service worker scoped to the deployed GitHub Pages path.

- Supported mobile browsers show an in-app **App installieren** button when the browser exposes the install prompt.
- After installation, the app launches in standalone mode.
- The service worker caches the app shell, generated build assets, manifest, and icons. After the first online visit, the app shell can load offline.
- Offline navigation falls back to the cached start page.

### Available commands

| Command | Description |
|--------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build the production app |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Run ESLint |

---

## Project structure

```text
src/
├── components/
│   ├── GradeSelector.tsx   # Belt grade selection screen
│   ├── InstallPrompt.tsx   # Install prompt for supported browsers
│   └── Quiz.tsx            # Main quiz logic and score screen
├── data/
│   ├── types.ts            # Shared Technique, Grade, and QuestionType types
│   ├── techniques.ts       # Technique source data with DJB content
│   └── grades.ts           # 8 grade objects with cumulative techniques
├── hooks/
│   └── useInstallPrompt.ts # Persistent install prompt state
├── utils/
│   └── quiz.ts             # Pure quiz helpers: shuffle, choices, scoring, and question types
├── pwa.ts                  # Service worker registration
└── test/
    └── setup.ts            # Vitest and Testing Library setup
```

---

## Tests

Vitest and Testing Library cover components, data integrity, progress tracking, and PWA behavior:

```bash
npm test
```

- `src/utils/quiz.test.ts`: pure quiz utility tests
- `src/data/data.test.ts`: technique data integrity tests
- `src/components/GradeSelector.test.tsx`
- `src/components/InstallPrompt.test.tsx`
- `src/components/Quiz.test.tsx`
- `src/App.test.tsx`: integration tests
- `src/pwa.test.ts` and `src/pwa-assets.test.ts`: service worker, manifest, and offline app shell tests

---

## CI/CD

- **CI** (`.github/workflows/ci.yml`): runs tests on every push and pull request
- **Deploy** (`.github/workflows/deploy.yml`): runs tests, builds the app, and deploys to GitHub Pages on pushes to `main`

### Dependency updates

Renovate manages npm and GitHub Actions updates through `renovate.json`. Eligible dependency and lockfile PRs enable GitHub auto-merge, and merging only happens after the required checks for `main` pass.

---

## Data model

```ts
interface Technique {
  id: string;
  term: string;          // Japanese term, for example "O-Goshi"
  meaning: string;       // German meaning, for example "Große Hüfte"
  translation?: string;  // Literal word-by-word translation
  category: string;      // For example "Koshi-Waza"
  comment?: string;      // Teaching hint
  link?: string;         // Link to judo.how
  imageUrl?: string;     // Wikimedia Commons image URL for throw illustrations
  introducedAt: number;  // Kyu grade where the technique is introduced, 8=beginner, 1=brown
}
```

---

## Sources

- [judo.how](https://judo.how/): technique references
- [DJB *Anforderungen für Kyu-Grade 2025* (PDF)](https://www.judobund.de/service/download-center)
- [DJB *Kyu-Graduierungssystem Technik-Pools* (PDF)](https://www.judobund.de/service/download-center/19)
- [DJB Download Center](https://www.judobund.de/service/download-center): official DJB documents, including the Judo values poster
