export const PROGRESS_STORAGE_KEY = 'judo-learning:progress:v1';
export const PROGRESS_VERSION = 1;

export interface TechniqueProgress {
  correctAnswers: number;
  wrongAnswers: number;
}

export interface GradeProgress {
  quizzesCompleted: number;
  totalAnswers: number;
  totalCorrectAnswers: number;
  bestScorePercentage: number;
}

export interface LatestCompletedQuiz {
  gradeId: string;
  gradeName: string;
  completedAt: string;
  score: number;
  totalQuestions: number;
  percentage: number;
}

export interface ProgressStats {
  version: typeof PROGRESS_VERSION;
  totalQuizzesCompleted: number;
  totalAnswers: number;
  totalCorrectAnswers: number;
  bestScorePercentage: number;
  latestSelectedGradeId: string | null;
  latestCompletedQuiz: LatestCompletedQuiz | null;
  grades: Record<string, GradeProgress>;
  techniques: Record<string, TechniqueProgress>;
}

export interface CompletedQuizAnswer {
  techniqueId: string;
  correct: boolean;
}

export interface CompletedQuiz {
  gradeId: string;
  gradeName: string;
  completedAt: string;
  score: number;
  totalQuestions: number;
  answers: CompletedQuizAnswer[];
}

type UnknownRecord = Record<string, unknown>;

export function createEmptyProgress(): ProgressStats {
  return {
    version: PROGRESS_VERSION,
    totalQuizzesCompleted: 0,
    totalAnswers: 0,
    totalCorrectAnswers: 0,
    bestScorePercentage: 0,
    latestSelectedGradeId: null,
    latestCompletedQuiz: null,
    grades: {},
    techniques: {},
  };
}

export function normalizeProgress(raw: unknown): ProgressStats {
  if (!isRecord(raw)) return createEmptyProgress();

  return {
    version: PROGRESS_VERSION,
    totalQuizzesCompleted: normalizeCount(raw.totalQuizzesCompleted),
    totalAnswers: normalizeCount(raw.totalAnswers),
    totalCorrectAnswers: normalizeCount(raw.totalCorrectAnswers),
    bestScorePercentage: normalizePercentage(raw.bestScorePercentage),
    latestSelectedGradeId: normalizeOptionalString(raw.latestSelectedGradeId),
    latestCompletedQuiz: normalizeLatestCompletedQuiz(raw.latestCompletedQuiz),
    grades: normalizeGradeProgress(raw.grades),
    techniques: normalizeTechniqueProgress(raw.techniques),
  };
}

export function loadProgress(storage?: Storage): ProgressStats {
  try {
    const targetStorage = storage ?? window.localStorage;
    const stored = targetStorage.getItem(PROGRESS_STORAGE_KEY);
    return stored ? normalizeProgress(JSON.parse(stored)) : createEmptyProgress();
  } catch (error) {
    console.warn('Lernfortschritt konnte nicht geladen werden.', error);
    return createEmptyProgress();
  }
}

export function saveProgress(progress: ProgressStats, storage?: Storage) {
  try {
    const targetStorage = storage ?? window.localStorage;
    targetStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(normalizeProgress(progress)));
  } catch (error) {
    console.warn('Lernfortschritt konnte nicht gespeichert werden.', error);
  }
}

export function resetProgress(storage?: Storage): ProgressStats {
  try {
    const targetStorage = storage ?? window.localStorage;
    targetStorage.removeItem(PROGRESS_STORAGE_KEY);
  } catch (error) {
    console.warn('Lernfortschritt konnte nicht zurückgesetzt werden.', error);
  }
  return createEmptyProgress();
}

export function selectLatestGrade(progress: ProgressStats, gradeId: string): ProgressStats {
  return {
    ...normalizeProgress(progress),
    latestSelectedGradeId: gradeId,
  };
}

export function recordCompletedQuiz(progress: ProgressStats, quiz: CompletedQuiz): ProgressStats {
  const current = normalizeProgress(progress);
  const totalQuestions = normalizeCount(quiz.totalQuestions);
  const score = Math.min(normalizeCount(quiz.score), totalQuestions);
  const percentage = calculatePercentage(score, totalQuestions);
  const gradeStats = current.grades[quiz.gradeId] ?? createEmptyGradeProgress();
  const nextTechniques = { ...current.techniques };

  quiz.answers.forEach((answer) => {
    if (!answer.techniqueId) return;

    const technique = nextTechniques[answer.techniqueId] ?? createEmptyTechniqueProgress();
    nextTechniques[answer.techniqueId] = {
      correctAnswers: technique.correctAnswers + (answer.correct ? 1 : 0),
      wrongAnswers: technique.wrongAnswers + (answer.correct ? 0 : 1),
    };
  });

  return {
    ...current,
    totalQuizzesCompleted: current.totalQuizzesCompleted + 1,
    totalAnswers: current.totalAnswers + totalQuestions,
    totalCorrectAnswers: current.totalCorrectAnswers + score,
    bestScorePercentage: Math.max(current.bestScorePercentage, percentage),
    latestCompletedQuiz: {
      gradeId: quiz.gradeId,
      gradeName: quiz.gradeName,
      completedAt: quiz.completedAt,
      score,
      totalQuestions,
      percentage,
    },
    grades: {
      ...current.grades,
      [quiz.gradeId]: {
        quizzesCompleted: gradeStats.quizzesCompleted + 1,
        totalAnswers: gradeStats.totalAnswers + totalQuestions,
        totalCorrectAnswers: gradeStats.totalCorrectAnswers + score,
        bestScorePercentage: Math.max(gradeStats.bestScorePercentage, percentage),
      },
    },
    techniques: nextTechniques,
  };
}

export function calculatePercentage(score: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  return normalizePercentage(Math.round((score / totalQuestions) * 100));
}

export function calculateAccuracy(correctAnswers: number, totalAnswers: number): number {
  return calculatePercentage(correctAnswers, totalAnswers);
}

function createEmptyGradeProgress(): GradeProgress {
  return {
    quizzesCompleted: 0,
    totalAnswers: 0,
    totalCorrectAnswers: 0,
    bestScorePercentage: 0,
  };
}

function createEmptyTechniqueProgress(): TechniqueProgress {
  return {
    correctAnswers: 0,
    wrongAnswers: 0,
  };
}

function normalizeGradeProgress(raw: unknown): Record<string, GradeProgress> {
  if (!isRecord(raw)) return {};

  return Object.entries(raw).reduce<Record<string, GradeProgress>>((normalized, [gradeId, value]) => {
    if (!isSafeStorageKey(gradeId) || !isRecord(value)) return normalized;

    normalized[gradeId] = {
      quizzesCompleted: normalizeCount(value.quizzesCompleted),
      totalAnswers: normalizeCount(value.totalAnswers),
      totalCorrectAnswers: normalizeCount(value.totalCorrectAnswers),
      bestScorePercentage: normalizePercentage(value.bestScorePercentage),
    };
    return normalized;
  }, {});
}

function normalizeTechniqueProgress(raw: unknown): Record<string, TechniqueProgress> {
  if (!isRecord(raw)) return {};

  return Object.entries(raw).reduce<Record<string, TechniqueProgress>>((normalized, [techniqueId, value]) => {
    if (!isSafeStorageKey(techniqueId) || !isRecord(value)) return normalized;

    normalized[techniqueId] = {
      correctAnswers: normalizeCount(value.correctAnswers),
      wrongAnswers: normalizeCount(value.wrongAnswers),
    };
    return normalized;
  }, {});
}

function normalizeLatestCompletedQuiz(raw: unknown): LatestCompletedQuiz | null {
  if (!isRecord(raw)) return null;

  const gradeId = normalizeOptionalString(raw.gradeId);
  const gradeName = normalizeOptionalString(raw.gradeName);
  const completedAt = normalizeOptionalString(raw.completedAt);

  if (!gradeId || !gradeName || !completedAt) return null;

  const totalQuestions = normalizeCount(raw.totalQuestions);
  const score = Math.min(normalizeCount(raw.score), totalQuestions);

  return {
    gradeId,
    gradeName,
    completedAt,
    score,
    totalQuestions,
    percentage: normalizePercentage(raw.percentage) || calculatePercentage(score, totalQuestions),
  };
}

function normalizeCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;
}

function normalizePercentage(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function normalizeOptionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSafeStorageKey(key: string): boolean {
  return key !== '' && key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
}
