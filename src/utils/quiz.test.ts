import { describe, it, expect } from 'vitest';
import { shuffle, buildChoices, scoreEmoji, scoreColor } from '../utils/quiz';
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

// ── buildChoices ──────────────────────────────────────────────────────────────

describe('buildChoices', () => {
  it('always returns exactly 4 choices', () => {
    const pool = makePool(10);
    const correct = pool[0];
    expect(buildChoices(correct, pool, 'term-to-meaning')).toHaveLength(4);
    expect(buildChoices(correct, pool, 'meaning-to-term')).toHaveLength(4);
  });

  it('always includes the correct answer in term-to-meaning mode', () => {
    const pool = makePool(10);
    const correct = pool[0];
    const choices = buildChoices(correct, pool, 'term-to-meaning');
    expect(choices).toContain(correct.meaning);
  });

  it('always includes the correct answer in meaning-to-term mode', () => {
    const pool = makePool(10);
    const correct = pool[0];
    const choices = buildChoices(correct, pool, 'meaning-to-term');
    expect(choices).toContain(correct.term);
  });

  it('does not include the correct item as a wrong answer (term-to-meaning)', () => {
    const pool = makePool(10);
    const correct = pool[0];
    const choices = buildChoices(correct, pool, 'term-to-meaning');
    const occurrences = choices.filter((c) => c === correct.meaning).length;
    expect(occurrences).toBe(1);
  });

  it('does not include the correct item as a wrong answer (meaning-to-term)', () => {
    const pool = makePool(10);
    const correct = pool[0];
    const choices = buildChoices(correct, pool, 'meaning-to-term');
    const occurrences = choices.filter((c) => c === correct.term).length;
    expect(occurrences).toBe(1);
  });

  it('all choices are strings', () => {
    const pool = makePool(10);
    const choices = buildChoices(pool[0], pool, 'term-to-meaning');
    choices.forEach((c) => expect(typeof c).toBe('string'));
  });

  it('returns fewer wrong answers when pool is small (2 total items)', () => {
    const pool = makePool(2);
    // Only 1 wrong answer available – should still return without crashing
    const choices = buildChoices(pool[0], pool, 'term-to-meaning');
    expect(choices).toContain(pool[0].meaning);
    expect(choices.length).toBeLessThanOrEqual(4);
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
