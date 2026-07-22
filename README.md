# 🥋 Judo Learning App

A mobile-friendly web app for learning Judo techniques and theory for Kyu grading. The app UI and quiz content are in German.

**Live:** [chriskujawa.github.io/judo-learning](https://chriskujawa.github.io/judo-learning/)

---

## Features

- **8 Kyu grades** from white-yellow (8th Kyu) to brown (1st Kyu)
- **Multiple-choice quiz** with two learning directions:
  - 🇯🇵 → 🇩🇪 Japanese term → German meaning
  - 🇩🇪 → 🇯🇵 German meaning → Japanese term
- **Cumulative technique pools** so higher grades include all techniques from previous levels
- **Immediate feedback** after each answer with explanations
- **Score summary** at the end of each round with emoji rating
- Installable as a mobile PWA with app-owned icons and standalone launch
- Offline-capable after the app has been opened once online

## Technique data

Content is based on the official DJB grading system:
- Basic terms (Dojo, Judogi, Rei, ...)
- Judo values (Jita Kyoei, Seiryoku Zenyo, ...)
- Throwing techniques: Ashi-Waza, Te-Waza, Koshi-Waza, Sutemi-Waza
- Ground techniques: Osaekomi-Waza, Kansetsu-Waza, Shime-Waza
- Basic stances, breakfalls, contest terms

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

The app runs at `http://localhost:5173/judo-learning/`.

### PWA and offline use

The app includes a web app manifest, app-owned icons, and a service worker for GitHub Pages under `/judo-learning/`.

- Supported mobile browsers show an in-app **App installieren** button when the browser exposes the install prompt.
- After installation, the app launches in standalone mode.
- The service worker caches the app shell, generated build assets, manifest, and icons. After the first online visit, the app shell can load offline.
- Offline navigation falls back to the cached start page.

### Available commands

| Command | Description |
|--------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Run ESLint |

---

## Project structure

```
src/
├── components/
│   ├── GradeSelector.tsx   # Grade selection (8th Kyu -> 1st Kyu)
│   ├── InstallPrompt.tsx   # Install prompt for supported browsers
│   └── Quiz.tsx            # Main quiz logic and score screen
├── data/
│   ├── types.ts            # Technique, Grade, QuizMode types
│   ├── techniques.ts       # ~55 techniques with DJB data
│   └── grades.ts           # 8 grade objects with cumulative techniques
├── utils/
│   └── quiz.ts             # Pure helpers (shuffle, buildChoices, ...)
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

- `src/utils/quiz.test.ts` - Pure utility functions
- `src/data/data.test.ts` - Data integrity for all techniques
- `src/components/GradeSelector.test.tsx`
- `src/components/InstallPrompt.test.tsx`
- `src/components/Quiz.test.tsx`
- `src/App.test.tsx` - Integration tests
- `src/pwa.test.ts` and `src/pwa-assets.test.ts` - Service worker, manifest, and offline app shell

---

## CI/CD

- **CI** (`.github/workflows/ci.yml`): tests on every push and pull request
- **Deploy** (`.github/workflows/deploy.yml`): tests, build, deploy to GitHub Pages on pushes to `main`

### Dependency updates

Renovate manages npm and GitHub Actions updates through `renovate.json`. Eligible dependency and lockfile PRs enable GitHub auto-merge, and merging only happens after required checks for `main` pass.

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
  introducedAt: number;  // Kyu level first required (8=beginner, 1=brown)
}
```

---

## Sources

- [judo.how](https://judo.how/) - Technique references
- [DJB *Anforderungen für Kyu-Grade 2025* (PDF)](https://www.judobund.de/service/download-center)
- [DJB *Kyu-Graduierungssystem Technik-Pools* (PDF)](https://www.judobund.de/service/download-center/19)
- [DJB Download-Center](https://www.judobund.de/service/download-center) - Official source for all DJB documents, including the Judo values poster
