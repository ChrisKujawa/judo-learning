import type { Technique, QuestionType } from '../data/types';

interface AssignQuestionTypeOptions {
  allowImageQuestions?: boolean;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Assigns a question type to a technique.
 * - Judo-Werte always get 'judo-wert'
 * - Techniques with an image randomly get 'image-to-name' or 'term-to-meaning' (50/50) when images are available
 * - Everything else gets 'term-to-meaning'
 */
export function assignQuestionType(
  technique: Technique,
  { allowImageQuestions = true }: AssignQuestionTypeOptions = {}
): QuestionType {
  if (technique.category === 'Judo-Werte') return 'judo-wert';
  if (allowImageQuestions && technique.imageUrl) {
    return Math.random() < 0.5 ? 'image-to-name' : 'term-to-meaning';
  }
  return 'term-to-meaning';
}

export function buildChoices(
  correct: Technique,
  all: Technique[],
  type: QuestionType
): string[] {
  // image-to-name and judo-wert both use the term as the correct answer
  const useTermAsAnswer = type === 'image-to-name' || type === 'judo-wert';
  const correctAnswer = useTermAsAnswer ? correct.term : correct.meaning;
  const pool = all
    .filter((t) => t.id !== correct.id)
    .map((t) => (useTermAsAnswer ? t.term : t.meaning));
  const wrong = shuffle(pool).slice(0, 3);
  return shuffle([correctAnswer, ...wrong]);
}

/** Distractor pool for Judo-Werte questions — plausible character traits that are NOT official Judo-Werte. */
export const WERTE_DISTRACTORS = [
  'Ausdauer', 'Neugier', 'Ehrgeiz', 'Geduld', 'Empathie',
  'Kreativität', 'Zuverlässigkeit', 'Optimismus', 'Fleiß', 'Toleranz',
  'Offenheit', 'Begeisterung', 'Verantwortung', 'Disziplin', 'Loyalität',
  'Mitgefühl', 'Entschlossenheit', 'Spontaneität', 'Gelassenheit',
  'Durchhaltevermögen', 'Vertrauen', 'Beharrlichkeit', 'Integrität',
  'Aufmerksamkeit', 'Einfühlungsvermögen',
];

/**
 * Builds choices for a Judo-Werte question.
 * Correct answer is the value's term; wrong answers are random distractors
 * from WERTE_DISTRACTORS (not other technique names).
 */
export function buildWertChoices(correct: Technique): string[] {
  const wrong = shuffle(WERTE_DISTRACTORS).slice(0, 3);
  return shuffle([correct.term, ...wrong]);
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
