import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PROGRESS_STORAGE_KEY,
  calculateAccuracy,
  createEmptyProgress,
  loadProgress,
  normalizeProgress,
  recordCompletedQuiz,
  resetProgress,
  saveProgress,
  selectLatestGrade,
  type CompletedQuiz,
} from '../utils/progress';

function makeCompletedQuiz(overrides: Partial<CompletedQuiz> = {}): CompletedQuiz {
  return {
    gradeId: 'kyu7',
    gradeName: '7. Kyu - Gelb',
    completedAt: '2026-07-22T19:00:00.000Z',
    score: 2,
    totalQuestions: 3,
    answers: [
      { techniqueId: 'o-goshi', correct: true },
      { techniqueId: 'tai-otoshi', correct: false },
      { techniqueId: 'o-soto-otoshi', correct: true },
    ],
    ...overrides,
  };
}

describe('progress storage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('creates an empty versioned progress model', () => {
    expect(createEmptyProgress()).toEqual({
      version: 1,
      totalQuizzesCompleted: 0,
      totalAnswers: 0,
      totalCorrectAnswers: 0,
      bestScorePercentage: 0,
      latestSelectedGradeId: null,
      latestCompletedQuiz: null,
      grades: {},
      techniques: {},
    });
  });

  it('normalizes missing and invalid stored fields to safe defaults', () => {
    const normalized = normalizeProgress({
      totalQuizzesCompleted: 2.8,
      totalAnswers: -10,
      totalCorrectAnswers: Number.NaN,
      bestScorePercentage: 150,
      latestSelectedGradeId: '',
      latestCompletedQuiz: {
        gradeId: 'kyu7',
        gradeName: '7. Kyu - Gelb',
        completedAt: '2026-07-22T19:00:00.000Z',
        score: 2,
        totalQuestions: 3,
      },
      grades: {
        kyu7: {
          quizzesCompleted: 1,
          totalAnswers: 3,
          totalCorrectAnswers: 2,
          bestScorePercentage: 66.7,
        },
        broken: null,
      },
      techniques: {
        'o-goshi': { correctAnswers: 1, wrongAnswers: 0 },
        invalid: 'nope',
      },
    });

    expect(normalized.totalQuizzesCompleted).toBe(2);
    expect(normalized.totalAnswers).toBe(0);
    expect(normalized.totalCorrectAnswers).toBe(0);
    expect(normalized.bestScorePercentage).toBe(100);
    expect(normalized.latestSelectedGradeId).toBeNull();
    expect(normalized.latestCompletedQuiz?.percentage).toBe(67);
    expect(normalized.grades.kyu7).toEqual({
      quizzesCompleted: 1,
      totalAnswers: 3,
      totalCorrectAnswers: 2,
      bestScorePercentage: 67,
    });
    expect(normalized.grades.broken).toBeUndefined();
    expect(normalized.techniques['o-goshi']).toEqual({ correctAnswers: 1, wrongAnswers: 0 });
    expect(normalized.techniques.invalid).toBeUndefined();
  });

  it('ignores unsafe storage keys while normalizing nested stats', () => {
    const normalized = normalizeProgress({
      grades: {
        __proto__: {
          quizzesCompleted: 9,
          totalAnswers: 9,
          totalCorrectAnswers: 9,
          bestScorePercentage: 100,
        },
        constructor: {
          quizzesCompleted: 9,
          totalAnswers: 9,
          totalCorrectAnswers: 9,
          bestScorePercentage: 100,
        },
        prototype: {
          quizzesCompleted: 9,
          totalAnswers: 9,
          totalCorrectAnswers: 9,
          bestScorePercentage: 100,
        },
        kyu7: {
          quizzesCompleted: 1,
          totalAnswers: 3,
          totalCorrectAnswers: 2,
          bestScorePercentage: 67,
        },
      },
      techniques: {
        __proto__: { correctAnswers: 9, wrongAnswers: 9 },
        constructor: { correctAnswers: 9, wrongAnswers: 9 },
        prototype: { correctAnswers: 9, wrongAnswers: 9 },
        'o-goshi': { correctAnswers: 1, wrongAnswers: 0 },
      },
    });

    expect(normalized.grades.kyu7).toEqual({
      quizzesCompleted: 1,
      totalAnswers: 3,
      totalCorrectAnswers: 2,
      bestScorePercentage: 67,
    });
    expect(Object.prototype.hasOwnProperty.call(normalized.grades, '__proto__')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(normalized.grades, 'constructor')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(normalized.grades, 'prototype')).toBe(false);
    expect(normalized.techniques['o-goshi']).toEqual({ correctAnswers: 1, wrongAnswers: 0 });
    expect(Object.prototype.hasOwnProperty.call(normalized.techniques, '__proto__')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(normalized.techniques, 'constructor')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(normalized.techniques, 'prototype')).toBe(false);
  });

  it('falls back to empty progress when stored JSON is corrupt', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    localStorage.setItem(PROGRESS_STORAGE_KEY, '{broken');

    expect(loadProgress()).toEqual(createEmptyProgress());
    expect(warn).toHaveBeenCalled();
  });

  it('loads normalized stored progress from localStorage', () => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ totalQuizzesCompleted: 1 }));

    expect(loadProgress().totalQuizzesCompleted).toBe(1);
  });

  it('falls back safely when default localStorage access is blocked during load', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        get localStorage() {
          throw new Error('storage blocked');
        },
      },
    });

    expect(loadProgress()).toEqual(createEmptyProgress());
    expect(warn).toHaveBeenCalled();

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  });

  it('saves normalized progress to localStorage', () => {
    const progress = {
      ...createEmptyProgress(),
      totalQuizzesCompleted: 1,
      bestScorePercentage: 99.4,
    };

    saveProgress(progress);

    expect(JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) ?? '{}')).toMatchObject({
      version: 1,
      totalQuizzesCompleted: 1,
      bestScorePercentage: 99,
    });
  });

  it('does not throw when default localStorage access is blocked during save or reset', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        get localStorage() {
          throw new Error('storage blocked');
        },
      },
    });

    expect(() => saveProgress(createEmptyProgress())).not.toThrow();
    expect(() => resetProgress()).not.toThrow();
    expect(warn).toHaveBeenCalledTimes(2);

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  });

  it('removes stored progress on reset', () => {
    saveProgress({ ...createEmptyProgress(), totalQuizzesCompleted: 1 });

    expect(resetProgress()).toEqual(createEmptyProgress());
    expect(localStorage.getItem(PROGRESS_STORAGE_KEY)).toBeNull();
  });
});

describe('progress aggregation', () => {
  it('records latest selected grade without changing quiz totals', () => {
    const progress = selectLatestGrade(createEmptyProgress(), 'kyu6');

    expect(progress.latestSelectedGradeId).toBe('kyu6');
    expect(progress.totalQuizzesCompleted).toBe(0);
  });

  it('aggregates completed quiz totals, grade stats, and technique stats', () => {
    const progress = recordCompletedQuiz(createEmptyProgress(), makeCompletedQuiz());

    expect(progress.totalQuizzesCompleted).toBe(1);
    expect(progress.totalAnswers).toBe(3);
    expect(progress.totalCorrectAnswers).toBe(2);
    expect(progress.bestScorePercentage).toBe(67);
    expect(progress.grades.kyu7).toEqual({
      quizzesCompleted: 1,
      totalAnswers: 3,
      totalCorrectAnswers: 2,
      bestScorePercentage: 67,
    });
    expect(progress.techniques['o-goshi']).toEqual({ correctAnswers: 1, wrongAnswers: 0 });
    expect(progress.techniques['tai-otoshi']).toEqual({ correctAnswers: 0, wrongAnswers: 1 });
    expect(progress.latestCompletedQuiz).toEqual({
      gradeId: 'kyu7',
      gradeName: '7. Kyu - Gelb',
      completedAt: '2026-07-22T19:00:00.000Z',
      score: 2,
      totalQuestions: 3,
      percentage: 67,
    });
  });

  it('keeps the best score percentage across multiple quizzes', () => {
    const first = recordCompletedQuiz(createEmptyProgress(), makeCompletedQuiz({ score: 3 }));
    const second = recordCompletedQuiz(first, makeCompletedQuiz({ score: 1 }));

    expect(second.bestScorePercentage).toBe(100);
    expect(second.grades.kyu7.bestScorePercentage).toBe(100);
    expect(second.totalQuizzesCompleted).toBe(2);
    expect(second.totalCorrectAnswers).toBe(4);
  });

  it('calculates accuracy from total answers', () => {
    expect(calculateAccuracy(3, 4)).toBe(75);
    expect(calculateAccuracy(0, 0)).toBe(0);
  });
});
