import type { Technique, QuestionType } from '../data/types';

export const QUIZ_QUESTION_LIMIT = 20;

interface AssignQuestionTypeOptions {
  allowImageQuestions?: boolean;
}

interface QuestionProgress {
  correctAnswers: number;
  wrongAnswers: number;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function questionSelectionWeight(progress?: QuestionProgress): number {
  if (!progress || progress.correctAnswers + progress.wrongAnswers === 0) return 6;

  const attempts = progress.correctAnswers + progress.wrongAnswers;
  return 1 + 4 * (progress.wrongAnswers / attempts);
}

export function selectQuizTechniques(
  techniques: Technique[],
  progress: Record<string, QuestionProgress> = {},
  limit = QUIZ_QUESTION_LIMIT,
  random = Math.random
): Technique[] {
  const candidates = techniques.map((technique) => ({
    technique,
    weight: questionSelectionWeight(progress[technique.id]),
  }));
  const selected: Technique[] = [];

  while (candidates.length > 0 && selected.length < limit) {
    const totalWeight = candidates.reduce((sum, candidate) => sum + candidate.weight, 0);
    let target = random() * totalWeight;
    let selectedIndex = candidates.length - 1;

    for (let index = 0; index < candidates.length; index++) {
      target -= candidates[index].weight;
      if (target < 0) {
        selectedIndex = index;
        break;
      }
    }

    selected.push(candidates[selectedIndex].technique);
    candidates.splice(selectedIndex, 1);
  }

  return selected;
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
