import type { Technique, QuizMode } from '../data/types';

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildChoices(
  correct: Technique,
  all: Technique[],
  mode: QuizMode
): string[] {
  const correctAnswer = mode === 'term-to-meaning' ? correct.meaning : correct.term;
  const pool = all
    .filter((t) => t.id !== correct.id)
    .map((t) => (mode === 'term-to-meaning' ? t.meaning : t.term));
  const wrong = shuffle(pool).slice(0, 3);
  return shuffle([correctAnswer, ...wrong]);
}

export function scoreEmoji(pct: number): string {
  if (pct >= 80) return '🏆';
  if (pct >= 50) return '👍';
  return '💪';
}

export function scoreColor(pct: number): string {
  if (pct >= 80) return '#16a34a';
  if (pct >= 50) return '#ca8a04';
  return '#dc2626';
}
