import { describe, it, expect } from 'vitest';
import { ALL_TECHNIQUES } from '../data/techniques';
import { grades } from '../data/grades';

// ── ALL_TECHNIQUES integrity ──────────────────────────────────────────────────

describe('ALL_TECHNIQUES', () => {
  it('is a non-empty array', () => {
    expect(ALL_TECHNIQUES.length).toBeGreaterThan(0);
  });

  it('every technique has a non-empty id', () => {
    ALL_TECHNIQUES.forEach((t) => {
      expect(t.id, `missing id for "${t.term}"`).toBeTruthy();
    });
  });

  it('every technique has a non-empty term', () => {
    ALL_TECHNIQUES.forEach((t) => {
      expect(t.term, `missing term for id "${t.id}"`).toBeTruthy();
    });
  });

  it('every technique has a non-empty meaning', () => {
    ALL_TECHNIQUES.forEach((t) => {
      expect(t.meaning, `missing meaning for "${t.term}"`).toBeTruthy();
    });
  });

  it('every technique has a non-empty category', () => {
    ALL_TECHNIQUES.forEach((t) => {
      expect(t.category, `missing category for "${t.term}"`).toBeTruthy();
    });
  });

  it('every technique has introducedAt between 1 and 8 (inclusive)', () => {
    ALL_TECHNIQUES.forEach((t) => {
      expect(t.introducedAt, `${t.term}`).toBeGreaterThanOrEqual(1);
      expect(t.introducedAt, `${t.term}`).toBeLessThanOrEqual(8);
    });
  });

  it('has no duplicate ids', () => {
    const ids = ALL_TECHNIQUES.map((t) => t.id);
    const unique = new Set(ids);
    expect(ids.length).toBe(unique.size);
  });

  it('has no duplicate terms', () => {
    const terms = ALL_TECHNIQUES.map((t) => t.term);
    const unique = new Set(terms);
    expect(terms.length).toBe(unique.size);
  });

  it('all links (if present) are valid URLs', () => {
    ALL_TECHNIQUES.filter((t) => t.link).forEach((t) => {
      expect(() => new URL(t.link!), `invalid link for "${t.term}"`).not.toThrow();
    });
  });
});

// ── grades integrity ──────────────────────────────────────────────────────────

describe('grades', () => {
  it('contains exactly 8 grades', () => {
    expect(grades).toHaveLength(8);
  });

  it('every grade has a unique id', () => {
    const ids = grades.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every grade has a non-empty name', () => {
    grades.forEach((g) => expect(g.name).toBeTruthy());
  });

  it('every grade has a non-empty subtitle', () => {
    grades.forEach((g) => expect(g.subtitle).toBeTruthy());
  });

  it('kyu values are 1–8 with no duplicates', () => {
    const kyus = grades.map((g) => g.kyu);
    expect(new Set(kyus).size).toBe(8);
    kyus.forEach((k) => {
      expect(k).toBeGreaterThanOrEqual(1);
      expect(k).toBeLessThanOrEqual(8);
    });
  });

  it('grades are ordered from highest kyu (8) to lowest (1)', () => {
    for (let i = 1; i < grades.length; i++) {
      expect(grades[i].kyu).toBeLessThan(grades[i - 1].kyu);
    }
  });

  it('every grade has at least 1 technique', () => {
    grades.forEach((g) => {
      expect(g.techniques.length, `${g.name} has no techniques`).toBeGreaterThan(0);
    });
  });

  it('higher grades (lower kyu) have at least as many techniques as lower grades', () => {
    // Techniques are cumulative – kyu1 must have >= kyu8
    const kyu8 = grades.find((g) => g.kyu === 8)!;
    const kyu1 = grades.find((g) => g.kyu === 1)!;
    expect(kyu1.techniques.length).toBeGreaterThanOrEqual(kyu8.techniques.length);
  });

  it('a technique introduced at kyu N appears in all grades with kyu <= N', () => {
    const technique = ALL_TECHNIQUES.find((t) => t.introducedAt === 5)!;
    if (!technique) return; // skip if none exist at that level

    const shouldHave = grades.filter((g) => g.kyu <= 5);
    const shouldNotHave = grades.filter((g) => g.kyu > 5);

    shouldHave.forEach((g) => {
      expect(
        g.techniques.some((t) => t.id === technique.id),
        `Grade ${g.name} should contain "${technique.term}"`
      ).toBe(true);
    });

    shouldNotHave.forEach((g) => {
      expect(
        g.techniques.some((t) => t.id === technique.id),
        `Grade ${g.name} should NOT contain "${technique.term}"`
      ).toBe(false);
    });
  });

  it('every grade has bgColor and textColor set', () => {
    grades.forEach((g) => {
      expect(g.bgColor, `${g.name} missing bgColor`).toBeTruthy();
      expect(g.textColor, `${g.name} missing textColor`).toBeTruthy();
    });
  });

  it('8. Kyu contains only introducedAt=8 techniques', () => {
    const kyu8 = grades.find((g) => g.kyu === 8)!;
    kyu8.techniques.forEach((t) => {
      expect(t.introducedAt, `"${t.term}" should not be in 8. Kyu`).toBe(8);
    });
  });
});
