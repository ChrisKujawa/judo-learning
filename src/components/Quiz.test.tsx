import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Quiz } from '../components/Quiz';
import type { Grade, Technique } from '../data/types';

// ── fixtures ──────────────────────────────────────────────────────────────────

function makeTechnique(overrides: Partial<Technique> = {}): Technique {
  return {
    id: 'o-goshi',
    term: 'O-Goshi',
    meaning: 'Große Hüfte',
    category: 'Koshi-Waza',
    introducedAt: 7,
    ...overrides,
  };
}

/** Builds a grade with N distinct techniques so buildChoices has enough distractors. */
function makeGrade(techniqueCount = 8, modeOverrides: Partial<Technique> = {}): Grade {
  const techniques: Technique[] = Array.from({ length: techniqueCount }, (_, i) =>
    makeTechnique({ id: `t${i}`, term: `Term ${i}`, meaning: `Meaning ${i}`, ...modeOverrides })
  );
  // Replace first item with a known one for assertion
  techniques[0] = makeTechnique({
    id: 'known',
    term: 'O-Goshi',
    meaning: 'Große Hüfte',
    comment: 'Toller Tipp',
    link: 'https://judo.how/o-goshi',
  });
  return {
    id: 'kyu7',
    kyu: 7,
    name: '7. Kyu – Gelb',
    subtitle: 'Test',
    bgColor: 'bg-yellow-400',
    textColor: 'text-yellow-900',
    techniques,
  };
}

// ── helpers ───────────────────────────────────────────────────────────────────

async function answerAllCorrectly(user: ReturnType<typeof userEvent.setup>, questionCount: number) {
  for (let i = 0; i < questionCount; i++) {
    const correctBtn = screen.getAllByTestId('choice-correct')[0];
    await user.click(correctBtn);
    const next = screen.getByTestId('next-btn');
    await user.click(next);
  }
}

// ── render & basic display ────────────────────────────────────────────────────

describe('Quiz – rendering', () => {
  it('renders without crashing', () => {
    render(<Quiz grade={makeGrade()} mode="term-to-meaning" onBack={vi.fn()} />);
    expect(screen.getByTestId('question')).toBeInTheDocument();
  });

  it('shows the term as question in term-to-meaning mode', () => {
    const grade = makeGrade();
    render(<Quiz grade={grade} mode="term-to-meaning" onBack={vi.fn()} />);
    const question = screen.getByTestId('question').textContent;
    const shownTerm = grade.techniques.find((t) => question === t.term);
    expect(shownTerm).toBeDefined();
  });

  it('shows the meaning as question in meaning-to-term mode', () => {
    const grade = makeGrade();
    render(<Quiz grade={grade} mode="meaning-to-term" onBack={vi.fn()} />);
    const question = screen.getByTestId('question').textContent;
    const shownTech = grade.techniques.find((t) => question === t.meaning);
    expect(shownTech).toBeDefined();
  });

  it('shows exactly 4 answer choices', () => {
    render(<Quiz grade={makeGrade()} mode="term-to-meaning" onBack={vi.fn()} />);
    const choicesContainer = screen.getByTestId('choices');
    expect(within(choicesContainer).getAllByRole('button')).toHaveLength(4);
  });

  it('shows progress counter starting at 1', () => {
    const grade = makeGrade(5);
    render(<Quiz grade={grade} mode="term-to-meaning" onBack={vi.fn()} />);
    expect(screen.getByTestId('progress').textContent).toMatch(/^1 \/ 5/);
  });

  it('shows initial score of 0', () => {
    render(<Quiz grade={makeGrade()} mode="term-to-meaning" onBack={vi.fn()} />);
    expect(screen.getByTestId('score').textContent).toContain('0');
  });

  it('shows the correct mode label for term-to-meaning', () => {
    render(<Quiz grade={makeGrade()} mode="term-to-meaning" onBack={vi.fn()} />);
    expect(screen.getByText(/Was bedeutet/)).toBeInTheDocument();
  });

  it('shows the correct mode label for meaning-to-term', () => {
    render(<Quiz grade={makeGrade()} mode="meaning-to-term" onBack={vi.fn()} />);
    expect(screen.getByText(/Wie heißt/)).toBeInTheDocument();
  });

  it('does not show the next button before answering', () => {
    render(<Quiz grade={makeGrade()} mode="term-to-meaning" onBack={vi.fn()} />);
    expect(screen.queryByTestId('next-btn')).not.toBeInTheDocument();
  });
});

// ── answering ─────────────────────────────────────────────────────────────────

describe('Quiz – answering', () => {
  it('shows next button after selecting any answer', async () => {
    const user = userEvent.setup();
    render(<Quiz grade={makeGrade()} mode="term-to-meaning" onBack={vi.fn()} />);
    await user.click(screen.getAllByRole('button', { name: /Term|Meaning|Hüfte/i })[0]);
    expect(screen.getByTestId('next-btn')).toBeInTheDocument();
  });

  it('increments score when correct answer is selected', async () => {
    const user = userEvent.setup();
    render(<Quiz grade={makeGrade()} mode="term-to-meaning" onBack={vi.fn()} />);
    await user.click(screen.getAllByTestId('choice-correct')[0]);
    expect(screen.getByTestId('score').textContent).toContain('1');
  });

  it('does not increment score when wrong answer is selected', async () => {
    const user = userEvent.setup();
    render(<Quiz grade={makeGrade()} mode="term-to-meaning" onBack={vi.fn()} />);
    const wrongBtns = screen.queryAllByTestId('choice-wrong');
    if (wrongBtns.length > 0) {
      await user.click(wrongBtns[0]);
      expect(screen.getByTestId('score').textContent).toContain('0');
    }
  });

  it('does not allow re-answering after an answer is selected', async () => {
    const user = userEvent.setup();
    render(<Quiz grade={makeGrade()} mode="term-to-meaning" onBack={vi.fn()} />);
    const correctBtn = screen.getAllByTestId('choice-correct')[0];
    await user.click(correctBtn);
    // Click again – score should still be 1
    await user.click(correctBtn);
    expect(screen.getByTestId('score').textContent).toContain('1');
  });

  it('shows hint after answering when comment is present', async () => {
    const user = userEvent.setup();
    // makeGrade puts a technique with comment at index 0, but quiz shuffles –
    // so we force a grade where ALL techniques have a comment
    const grade: Grade = {
      id: 'g',
      kyu: 7,
      name: 'Test',
      subtitle: '',
      bgColor: '',
      textColor: '',
      techniques: Array.from({ length: 5 }, (_, i) =>
        makeTechnique({ id: `t${i}`, term: `T${i}`, meaning: `M${i}`, comment: 'Tipp für alle' })
      ),
    };
    render(<Quiz grade={grade} mode="term-to-meaning" onBack={vi.fn()} />);
    await user.click(screen.getAllByRole('button', { name: /T|M/i })[0]);
    expect(screen.getByTestId('hint')).toBeInTheDocument();
  });

  it('shows judo.how link after answering when link is present', async () => {
    const user = userEvent.setup();
    const grade: Grade = {
      id: 'g',
      kyu: 7,
      name: 'Test',
      subtitle: '',
      bgColor: '',
      textColor: '',
      techniques: Array.from({ length: 5 }, (_, i) =>
        makeTechnique({
          id: `t${i}`,
          term: `T${i}`,
          meaning: `M${i}`,
          link: 'https://judo.how/test',
        })
      ),
    };
    render(<Quiz grade={grade} mode="term-to-meaning" onBack={vi.fn()} />);
    await user.click(screen.getAllByRole('button', { name: /T|M/i })[0]);
    expect(screen.getByTestId('judo-how-link')).toBeInTheDocument();
  });
});

// ── navigation ────────────────────────────────────────────────────────────────

describe('Quiz – navigation', () => {
  it('advances to the next question when "Weiter" is clicked', async () => {
    const user = userEvent.setup();
    const grade = makeGrade(5);
    render(<Quiz grade={grade} mode="term-to-meaning" onBack={vi.fn()} />);
    await user.click(screen.getAllByTestId('choice-correct')[0]);
    await user.click(screen.getByTestId('next-btn'));
    expect(screen.getByTestId('progress').textContent).toMatch(/^2 \/ 5/);
  });

  it('shows "Ergebnis anzeigen" label on the last question', async () => {
    const user = userEvent.setup();
    const grade = makeGrade(2);
    render(<Quiz grade={grade} mode="term-to-meaning" onBack={vi.fn()} />);
    // Answer first question and advance
    await user.click(screen.getAllByTestId('choice-correct')[0]);
    await user.click(screen.getByTestId('next-btn'));
    // Now on last question – answer it
    await user.click(screen.getAllByTestId('choice-correct')[0]);
    expect(screen.getByTestId('next-btn').textContent).toBe('Ergebnis anzeigen');
  });

  it('calls onBack when the back button is clicked', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<Quiz grade={makeGrade()} mode="term-to-meaning" onBack={onBack} />);
    await user.click(screen.getByText(/Zurück/));
    expect(onBack).toHaveBeenCalledOnce();
  });
});

// ── score screen ──────────────────────────────────────────────────────────────

describe('Quiz – score screen', () => {
  it('shows the score screen after the last question', async () => {
    const user = userEvent.setup();
    const grade = makeGrade(3);
    render(<Quiz grade={grade} mode="term-to-meaning" onBack={vi.fn()} />);
    await answerAllCorrectly(user, grade.techniques.length);
    expect(screen.getByText('Quiz beendet!')).toBeInTheDocument();
  });

  it('shows 100% when all answers are correct', async () => {
    const user = userEvent.setup();
    const grade = makeGrade(3);
    render(<Quiz grade={grade} mode="term-to-meaning" onBack={vi.fn()} />);
    await answerAllCorrectly(user, grade.techniques.length);
    expect(screen.getByTestId('score-pct').textContent).toBe('100%');
  });

  it('shows 🏆 emoji for 100%', async () => {
    const user = userEvent.setup();
    const grade = makeGrade(3);
    render(<Quiz grade={grade} mode="term-to-meaning" onBack={vi.fn()} />);
    await answerAllCorrectly(user, grade.techniques.length);
    expect(screen.getByTestId('score-emoji').textContent).toBe('🏆');
  });

  it('shows correct "X von Y richtig" summary text', async () => {
    const user = userEvent.setup();
    const grade = makeGrade(3);
    render(<Quiz grade={grade} mode="term-to-meaning" onBack={vi.fn()} />);
    await answerAllCorrectly(user, grade.techniques.length);
    expect(screen.getByTestId('score-text').textContent).toMatch(/3 von 3/);
  });

  it('calls onBack when "Nochmal üben" is clicked on the score screen', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    const grade = makeGrade(2);
    render(<Quiz grade={grade} mode="term-to-meaning" onBack={onBack} />);
    await answerAllCorrectly(user, grade.techniques.length);
    await user.click(screen.getByText('Nochmal üben'));
    expect(onBack).toHaveBeenCalledOnce();
  });
});

// ── Judo-Werte special mode ───────────────────────────────────────────────────

function makeWertGrade(): Grade {
  const werte: Technique[] = [
    { id: 'wert-respekt', term: 'Respekt', meaning: 'Begegne allen Menschen mit Achtung', category: 'Judo-Werte', introducedAt: 8 },
    { id: 'wert-mut', term: 'Mut', meaning: 'Gib niemals auf', category: 'Judo-Werte', introducedAt: 8 },
    { id: 'wert-ehrlichkeit', term: 'Ehrlichkeit', meaning: 'Kämpfe fair', category: 'Judo-Werte', introducedAt: 8 },
    { id: 'wert-hoeflichkeit', term: 'Höflichkeit', meaning: 'Behandle andere mit Wertschätzung', category: 'Judo-Werte', introducedAt: 8 },
  ];
  return { id: 'wert-grade', kyu: 8, name: '8. Kyu', subtitle: 'Test', bgColor: '', textColor: '', techniques: werte };
}

describe('Quiz – Judo-Werte special mode', () => {
  it('shows fixed question text regardless of mode', () => {
    render(<Quiz grade={makeWertGrade()} mode="term-to-meaning" onBack={vi.fn()} />);
    expect(screen.getByTestId('question').textContent).toBe('Welcher Begriff ist ein Judo-Wert?');
  });

  it('shows fixed question text in meaning-to-term mode too', () => {
    render(<Quiz grade={makeWertGrade()} mode="meaning-to-term" onBack={vi.fn()} />);
    expect(screen.getByTestId('question').textContent).toBe('Welcher Begriff ist ein Judo-Wert?');
  });

  it('shows "Judo-Wert erkennen" label', () => {
    render(<Quiz grade={makeWertGrade()} mode="term-to-meaning" onBack={vi.fn()} />);
    expect(screen.getByText('Judo-Wert erkennen')).toBeInTheDocument();
  });

  it('correct answer button shows the value term', () => {
    render(<Quiz grade={makeWertGrade()} mode="term-to-meaning" onBack={vi.fn()} />);
    const correct = screen.getAllByTestId('choice-correct')[0];
    const werte = ['Respekt', 'Mut', 'Ehrlichkeit', 'Höflichkeit'];
    expect(werte).toContain(correct.textContent?.trim());
  });

  it('shows meaning as hint after answering', async () => {
    const user = userEvent.setup();
    render(<Quiz grade={makeWertGrade()} mode="term-to-meaning" onBack={vi.fn()} />);
    await user.click(screen.getAllByTestId('choice-correct')[0]);
    expect(screen.getByTestId('hint')).toBeInTheDocument();
  });
});

// ── Technique image display ───────────────────────────────────────────────────

function makeGradeWithImages(): Grade {
  const techniques: Technique[] = [
    { id: 'o-goshi', term: 'O-Goshi', meaning: 'Große Hüfte', category: 'Koshi-Waza', introducedAt: 7, imageUrl: 'https://example.com/o-goshi.jpg' },
    { id: 'uchi-mata', term: 'Uchi-Mata', meaning: 'Innerer Schenkelwurf', category: 'Ashi-Waza', introducedAt: 5, imageUrl: 'https://example.com/uchi-mata.jpg' },
    { id: 'tai-otoshi', term: 'Tai-Otoshi', meaning: 'Körpersturz', category: 'Te-Waza', introducedAt: 7, imageUrl: 'https://example.com/tai-otoshi.jpg' },
    { id: 'harai-goshi', term: 'Harai-Goshi', meaning: 'Hüftfeger', category: 'Koshi-Waza', introducedAt: 5, imageUrl: 'https://example.com/harai-goshi.jpg' },
  ];
  return { id: 'kyu7', kyu: 7, name: '7. Kyu', subtitle: 'Test', bgColor: '', textColor: '', techniques };
}

describe('Quiz – technique images', () => {
  it('shows technique image when imageUrl is present', () => {
    render(<Quiz grade={makeGradeWithImages()} mode="term-to-meaning" onBack={vi.fn()} />);
    expect(screen.getByTestId('technique-image')).toBeInTheDocument();
  });

  it('shows image AND text question together', () => {
    render(<Quiz grade={makeGradeWithImages()} mode="term-to-meaning" onBack={vi.fn()} />);
    expect(screen.getByTestId('technique-image')).toBeInTheDocument();
    expect(screen.getByTestId('question')).toBeInTheDocument();
  });

  it('does not show image when technique has no imageUrl', () => {
    render(<Quiz grade={makeGrade()} mode="term-to-meaning" onBack={vi.fn()} />);
    expect(screen.queryByTestId('technique-image')).not.toBeInTheDocument();
  });

  it('image has meaningful alt text', () => {
    render(<Quiz grade={makeGradeWithImages()} mode="term-to-meaning" onBack={vi.fn()} />);
    const img = screen.getByTestId('technique-image');
    expect(img.getAttribute('alt')).toMatch(/Illustration/);
  });
});
