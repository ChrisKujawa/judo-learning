import { afterEach, describe, it, expect, vi } from 'vitest';
import { shuffle, assignQuestionType, buildChoices, buildWertChoices, WERTE_DISTRACTORS, scoreEmoji, scoreColor } from '../utils/quiz';
import type { Technique } from '../data/types';

// ── helpers ──────────────────────────────────────────────────────────────────

function makeTechnique(overrides: Partial<Technique> = {}): Technique {
  return {
    id: 'test-id',
    term: 'O-Goshi',
    meaning: 'Große Hüfte',
    category: 'Koshi-Waza',
    introducedAt: 7,
    ...overrides,
  };
}

function makePool(count: number): Technique[] {
  return Array.from({ length: count }, (_, i) =>
    makeTechnique({ id: `t${i}`, term: `Term ${i}`, meaning: `Meaning ${i}` })
  );
}

// ── shuffle ───────────────────────────────────────────────────────────────────

describe('shuffle', () => {
  it('returns an array of the same length', () => {
    expect(shuffle([1, 2, 3, 4, 5])).toHaveLength(5);
  });

  it('contains all original elements', () => {
    const original = [1, 2, 3, 4, 5];
    expect(shuffle(original).sort()).toEqual([...original].sort());
  });

  it('does not mutate the original array', () => {
    const original = [1, 2, 3];
    const copy = [...original];
    shuffle(original);
    expect(original).toEqual(copy);
  });

  it('returns a new array reference', () => {
    const original = [1, 2, 3];
    expect(shuffle(original)).not.toBe(original);
  });

  it('handles empty arrays', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('handles single-element arrays', () => {
    expect(shuffle([42])).toEqual([42]);
  });

  it('produces different orderings over many runs (statistical)', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const serialized = new Set(
      Array.from({ length: 30 }, () => shuffle(arr).join(','))
    );
    // Probability of always same order is (1/8!)^29 ≈ 0
    expect(serialized.size).toBeGreaterThan(1);
  });
});

// ── assignQuestionType ────────────────────────────────────────────────────────

describe('assignQuestionType', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns "judo-wert" for Judo-Werte techniques', () => {
    const t = makeTechnique({ category: 'Judo-Werte' });
    expect(assignQuestionType(t)).toBe('judo-wert');
  });

  it('returns "term-to-meaning" for techniques without imageUrl', () => {
    const t = makeTechnique({ category: 'Koshi-Waza', imageUrl: undefined });
    expect(assignQuestionType(t)).toBe('term-to-meaning');
  });

  it('returns "image-to-name" for techniques with imageUrl when random is below 0.5', () => {
    const t = makeTechnique({ category: 'Koshi-Waza', imageUrl: 'https://example.com/img.jpg' });
    vi.spyOn(Math, 'random').mockReturnValue(0.49);

    expect(assignQuestionType(t)).toBe('image-to-name');
  });

  it('returns "term-to-meaning" for techniques with imageUrl when random is at least 0.5', () => {
    const t = makeTechnique({ category: 'Koshi-Waza', imageUrl: 'https://example.com/img.jpg' });
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    expect(assignQuestionType(t)).toBe('term-to-meaning');
  });

  it('does not return "image-to-name" when image questions are disabled', () => {
    const t = makeTechnique({ category: 'Koshi-Waza', imageUrl: 'https://example.com/img.jpg' });
    const results = new Set(
      Array.from({ length: 50 }, () => assignQuestionType(t, { allowImageQuestions: false }))
    );
    expect(results).toEqual(new Set(['term-to-meaning']));
  });

  it('never returns "judo-wert" for non-Werte techniques', () => {
    const t = makeTechnique({ category: 'Koshi-Waza', imageUrl: 'https://example.com/img.jpg' });
    for (let i = 0; i < 20; i++) {
      expect(assignQuestionType(t)).not.toBe('judo-wert');
    }
  });
});

// ── buildChoices ──────────────────────────────────────────────────────────────

describe('buildChoices', () => {
  it('always returns exactly 4 choices', () => {
    const pool = makePool(10);
    const correct = pool[0];
    expect(buildChoices(correct, pool, 'term-to-meaning')).toHaveLength(4);
    expect(buildChoices(correct, pool, 'image-to-name')).toHaveLength(4);
  });

  it('correct answer is meaning for term-to-meaning', () => {
    const pool = makePool(10);
    const correct = pool[0];
    expect(buildChoices(correct, pool, 'term-to-meaning')).toContain(correct.meaning);
  });

  it('correct answer is term for image-to-name', () => {
    const pool = makePool(10);
    const correct = pool[0];
    expect(buildChoices(correct, pool, 'image-to-name')).toContain(correct.term);
  });

  it('correct answer appears exactly once (term-to-meaning)', () => {
    const pool = makePool(10);
    const correct = pool[0];
    const choices = buildChoices(correct, pool, 'term-to-meaning');
    expect(choices.filter((c) => c === correct.meaning)).toHaveLength(1);
  });

  it('correct answer appears exactly once (image-to-name)', () => {
    const pool = makePool(10);
    const correct = pool[0];
    const choices = buildChoices(correct, pool, 'image-to-name');
    expect(choices.filter((c) => c === correct.term)).toHaveLength(1);
  });

  it('all choices are strings', () => {
    const pool = makePool(10);
    buildChoices(pool[0], pool, 'term-to-meaning').forEach((c) => expect(typeof c).toBe('string'));
  });

  it('returns fewer wrong answers when pool is small (2 total items)', () => {
    const pool = makePool(2);
    const choices = buildChoices(pool[0], pool, 'term-to-meaning');
    expect(choices).toContain(pool[0].meaning);
    expect(choices.length).toBeLessThanOrEqual(4);
  });
});

// ── buildWertChoices ──────────────────────────────────────────────────────────

describe('buildWertChoices', () => {
  const wert = makeTechnique({
    id: 'wert-respekt',
    term: 'Respekt',
    meaning: 'Begegne allen Menschen mit Achtung',
    category: 'Judo-Werte',
  });

  it('returns exactly 4 choices', () => {
    expect(buildWertChoices(wert)).toHaveLength(4);
  });

  it('includes the correct term', () => {
    expect(buildWertChoices(wert)).toContain('Respekt');
  });

  it('correct term appears exactly once', () => {
    const choices = buildWertChoices(wert);
    expect(choices.filter((c) => c === 'Respekt')).toHaveLength(1);
  });

  it('all choices are strings', () => {
    buildWertChoices(wert).forEach((c) => expect(typeof c).toBe('string'));
  });

  it('wrong choices come from WERTE_DISTRACTORS', () => {
    const choices = buildWertChoices(wert).filter((c) => c !== 'Respekt');
    choices.forEach((c) => expect(WERTE_DISTRACTORS).toContain(c));
  });

  it('has no duplicate choices', () => {
    const choices = buildWertChoices(wert);
    expect(new Set(choices).size).toBe(choices.length);
  });

  it('does not include the meaning as a choice', () => {
    const choices = buildWertChoices(wert);
    expect(choices).not.toContain(wert.meaning);
  });
});

// ── scoreEmoji ────────────────────────────────────────────────────────────────

describe('scoreEmoji', () => {
  it('returns 🏆 for 80% and above', () => {
    expect(scoreEmoji(80)).toBe('🏆');
    expect(scoreEmoji(100)).toBe('🏆');
    expect(scoreEmoji(95)).toBe('🏆');
  });

  it('returns 👍 for 50–79%', () => {
    expect(scoreEmoji(50)).toBe('👍');
    expect(scoreEmoji(79)).toBe('👍');
    expect(scoreEmoji(65)).toBe('👍');
  });

  it('returns 💪 for below 50%', () => {
    expect(scoreEmoji(49)).toBe('💪');
    expect(scoreEmoji(0)).toBe('💪');
    expect(scoreEmoji(25)).toBe('💪');
  });
});

// ── scoreColor ────────────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns green for ≥80%', () => {
    expect(scoreColor(80)).toBe('#16a34a');
    expect(scoreColor(100)).toBe('#16a34a');
  });

  it('returns yellow for 50–79%', () => {
    expect(scoreColor(50)).toBe('#ca8a04');
    expect(scoreColor(79)).toBe('#ca8a04');
  });

  it('returns red for <50%', () => {
    expect(scoreColor(0)).toBe('#dc2626');
    expect(scoreColor(49)).toBe('#dc2626');
  });
});
