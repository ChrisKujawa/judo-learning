# Agent Instructions — Judo Learning App

This file provides context for AI coding agents (e.g. GitHub Copilot) working in this repository.

---

## Project Overview

A mobile-friendly quiz app for learning Judo theory (Japanese terms, technique names, values) in preparation for DJB Kyu-grade exams. Built with React + Vite + TypeScript + Tailwind CSS, deployed to GitHub Pages.

**Live URL:** https://chriskujawa.github.io/judo-learning/

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build | Vite 5 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Testing | Vitest 1 + Testing Library |
| Hosting | GitHub Pages (via Actions) |

> **Node constraint:** The project runs on Node 18. Do NOT upgrade to Vitest 2 (requires Node 20+) or use jsdom (ESM conflict on Node 18 — use `happy-dom` instead).

---

## Key Constraints & Gotchas

- `vitest.config.ts` MUST import `defineConfig` from `vitest/config`, **not** from `vite`. Using the Vite import causes `tsc` to reject the `test` property during `npm run build`.
- `vite.config.ts` must NOT contain a `test` block.
- Vite `base` is set to `'/judo-learning/'` — required for GitHub Pages subfolder hosting.
- All user-facing text is in **German**. Japanese terms are shown as quiz prompts; German meanings are the answer options (and vice versa in the reverse mode).

---

## Data Model

```ts
// src/data/types.ts
interface Technique {
  id: string;
  term: string;          // Japanese term (e.g. "O-Goshi")
  meaning: string;       // German meaning (e.g. "Große Hüfte")
  translation?: string;  // Literal word-by-word translation
  category: string;      // e.g. "Koshi-Waza"
  comment?: string;      // Teaching hint shown after answering
  link?: string;         // URL to judo.how reference
  introducedAt: number;  // Kyu level first required (8=beginner, 1=brown)
}

interface Grade {
  id: string;
  kyu: number;           // 8 (white-yellow) → 1 (brown)
  name: string;          // e.g. "8. Kyu"
  subtitle: string;      // e.g. "Weiß-Gelb"
  bgColor: string;       // Tailwind bg class
  textColor: string;     // Tailwind text class
  techniques: Technique[];
}

type QuizMode = 'term-to-meaning' | 'meaning-to-term';
```

**Grade filtering:** `techniquesForGrade(kyu)` returns `ALL_TECHNIQUES.filter(t => t.introducedAt >= kyu)`. Higher grades (lower kyu number) get a larger cumulative pool.

---

## Project Structure

```
src/
├── components/
│   ├── GradeSelector.tsx     # Belt grade selection screen
│   ├── ModeSelector.tsx      # Quiz mode selection screen
│   └── Quiz.tsx              # Quiz logic + score screen
├── data/
│   ├── types.ts              # Shared TypeScript types
│   ├── techniques.ts         # All ~55 techniques (source of truth)
│   └── grades.ts             # 8 Grade objects with cumulative techniques
├── utils/
│   └── quiz.ts               # Pure functions: shuffle, buildChoices, scoreEmoji, scoreColor
├── test/
│   └── setup.ts              # @testing-library/jest-dom setup
├── App.tsx                   # Top-level state: grade → mode → quiz
└── main.tsx
```

---

## Testing

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

> **Rule:** Every new feature and every bug fix must include tests. No PR should be merged without corresponding test coverage for the changed behaviour.

All components use `data-testid` attributes for reliable test targeting:
- `data-testid="grade-btn-{id}"` — grade buttons in GradeSelector
- `data-testid="mode-btn-{mode}"` — mode buttons in ModeSelector
- `data-testid="choice-correct"` / `data-testid="choice-wrong"` — answer buttons in Quiz
- `data-testid="next-btn"` — next question button
- `data-testid="score-screen"` — end screen

When adding new components: add `data-testid` attributes and write tests in a sibling `.test.tsx` file.

---

## Adding Content

To add new techniques, edit `src/data/techniques.ts`:

```ts
{
  id: 'unique-kebab-id',
  term: 'Japanese Term',
  meaning: 'Deutsche Bedeutung',
  translation: 'Wort-für-Wort', // optional
  category: 'Kategorie',
  comment: 'Hinweis für Lernende', // optional
  link: 'https://judo.how/techniques/...', // optional
  introducedAt: 5, // Kyu level (1–8)
}
```

No other files need updating — `grades.ts` picks up new techniques automatically via the filter.

---

## CI/CD

| Workflow | Trigger | Steps |
|----------|---------|-------|
| `ci.yml` | push / PR to main | checkout → setup Node 20 → `npm ci` → `npm test` |
| `deploy.yml` | push to main | checkout → setup Node 20 → `npm ci` → `npm test` → `npm run build` → deploy to Pages |

Both workflows use Node 20 in GitHub Actions (even though local dev targets Node 18 — GH Actions LTS).

---

## Data Sources

- [judo.how](https://judo.how/) — technique reference and descriptions
- [DJB *Anforderungen für Kyu-Grade 2025* (PDF)](https://www.wjv.de/files/2025/Anforderungen_fuer_Kyu-Grade_2025_V2.pdf) — grade requirements per Kyu level
- [DJB *Kyu-Graduierungssystem Technik-Pools* (PDF)](https://www.judobund.de/service/download-center/19) — technique pool categorisation (Grundprogramm, Erweiterungsprogramm, etc.)
- [DJB Download-Center](https://www.judobund.de/service/download-center) — official source for all DJB documents including the Judo-Werte Plakat

---

## Known Gaps / Future Work

- Grades 2 and 1 (Kyu) have fewer exclusive techniques in `techniques.ts` — more entries can be added
- Pictogram/image quiz mode (show a judo.how image → pick the throw name) is not yet implemented
- "Nur neue Techniken" toggle (filter to only new techniques for the selected grade) is not yet built
