# 🥋 Judo Learning App

Eine mobile-freundliche Web-App zum Lernen von Judo-Techniken und -Theorie für die Kyu-Graduierung — auf Deutsch.

**Live:** [chriskujawa.github.io/judo-learning](https://chriskujawa.github.io/judo-learning/)

---

## Features

- **8 Kyu-Grade** von Weiß-Gelb (8. Kyu) bis Braun (1. Kyu)
- **Multiple-Choice-Quiz** mit zwei Lernmodi:
  - 🇯🇵 → 🇩🇪 Japanischer Begriff → Deutsche Bedeutung
  - 🇩🇪 → 🇯🇵 Deutsche Bedeutung → Japanischer Begriff
- **Kumulative Technik-Pools** — höhere Grade enthalten alle Techniken der Vorstufen
- **Sofortiges Feedback** nach jeder Antwort mit Erklärungen
- **Score-Übersicht** am Ende jeder Runde mit Emoji-Bewertung
- Mobiloptimiert, funktioniert offline (PWA-ready)

## Technik-Daten

Inhalte basieren auf dem offiziellen DJB-Graduierungssystem:
- Grundbegriffe (Dojo, Judogi, Rei, …)
- Judo-Werte (Jita Kyoei, Seiryoku Zenyo, …)
- Wurftechniken: Ashi-Waza, Te-Waza, Koshi-Waza, Sutemi-Waza
- Bodentechniken: Osaekomi-Waza, Kansetsu-Waza, Shime-Waza
- Grundstellungen, Fallübungen, Kampfbegriffe

---

## Lokale Entwicklung

### Voraussetzungen

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/ChrisKujawa/judo-learning.git
cd judo-learning
npm install
npm run dev
```

Die App läuft dann unter `http://localhost:5173/judo-learning/`.

### Verfügbare Befehle

| Befehl | Beschreibung |
|--------|-------------|
| `npm run dev` | Entwicklungsserver starten |
| `npm run build` | Produktionsbuild erstellen |
| `npm run preview` | Produktionsbuild lokal vorschauen |
| `npm test` | Tests einmalig ausführen |
| `npm run test:watch` | Tests im Watch-Modus |
| `npm run test:coverage` | Tests mit Coverage-Report |
| `npm run lint` | ESLint ausführen |

---

## Projektstruktur

```
src/
├── components/
│   ├── GradeSelector.tsx   # Grad-Auswahl (8. Kyu → 1. Kyu)
│   ├── ModeSelector.tsx    # Quiz-Modus-Auswahl
│   └── Quiz.tsx            # Haupt-Quiz-Logik & Score-Screen
├── data/
│   ├── types.ts            # Technique, Grade, QuizMode Typen
│   ├── techniques.ts       # ~55 Techniken mit DJB-Daten
│   └── grades.ts           # 8 Grad-Objekte mit kumulativen Techniken
├── utils/
│   └── quiz.ts             # Reine Hilfsfunktionen (shuffle, buildChoices, …)
└── test/
    └── setup.ts            # Vitest + Testing Library Setup
```

---

## Tests

85 Tests über 6 Dateien mit Vitest + Testing Library:

```bash
npm test
```

- `src/utils/quiz.test.ts` — Reine Util-Funktionen
- `src/data/data.test.ts` — Datenintegrität aller Techniken
- `src/components/GradeSelector.test.tsx`
- `src/components/ModeSelector.test.tsx`
- `src/components/Quiz.test.tsx`
- `src/App.test.tsx` — Integrationstests

---

## CI/CD

- **CI** (`.github/workflows/ci.yml`): Tests auf jedem Push und Pull Request
- **Deploy** (`.github/workflows/deploy.yml`): Tests → Build → Deploy auf GitHub Pages bei Push auf `main`

### Abhängigkeits-Updates

Renovate verwaltet npm- und GitHub-Actions-Updates über `renovate.json`. Geeignete Dependency- und Lockfile-PRs aktivieren GitHub Auto-Merge, der Merge erfolgt erst nach erfolgreichen Pflicht-Checks für `main`.

---

## Datenmodell

```ts
interface Technique {
  id: string;
  term: string;          // Japanischer Begriff (z.B. "O-Goshi")
  meaning: string;       // Deutsche Bedeutung (z.B. "Große Hüfte")
  translation?: string;  // Wort-für-Wort-Übersetzung
  category: string;      // z.B. "Koshi-Waza"
  comment?: string;      // Pädagogischer Hinweis
  link?: string;         // Link zu judo.how
  introducedAt: number;  // Kyu-Stufe der Einführung (8=Anfänger, 1=Braun)
}
```

---

## Quellen

- [judo.how](https://judo.how/) — Technik-Referenzen
- [DJB *Anforderungen für Kyu-Grade 2025* (PDF)](https://www.judobund.de/service/download-center)
- [DJB *Kyu-Graduierungssystem Technik-Pools* (PDF)](https://www.judobund.de/service/download-center/19)
- [DJB Download-Center](https://www.judobund.de/service/download-center) — alle offiziellen Dokumente inkl. Judo-Werte Plakat
