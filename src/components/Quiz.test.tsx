import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Quiz } from '../components/Quiz';
import type { Grade, Technique, QuestionType } from '../data/types';
import { createEmptyProgress, type ProgressStats } from '../utils/progress';

// Module-level closure variable to pin assignQuestionType in deterministic tests.
// null = use real implementation (default for all other tests)
let _forcedQuestionType: QuestionType | null = null;

vi.mock('../utils/quiz', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/quiz')>();
  return {
    ...actual,
    assignQuestionType: (...args: Parameters<typeof actual.assignQuestionType>) =>
      _forcedQuestionType !== null ? _forcedQuestionType : actual.assignQuestionType(...args),
  };
});

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

function makeGrade(techniqueCount = 8, overrides: Partial<Technique> = {}): Grade {
  const techniques: Technique[] = Array.from({ length: techniqueCount }, (_, i) =>
    makeTechnique({ id: `t${i}`, term: `Term ${i}`, meaning: `Meaning ${i}`, ...overrides })
  );
  techniques[0] = makeTechnique({
    id: 'known',
    term: 'O-Goshi',
    meaning: 'Große Hüfte',
    comment: 'Toller Tipp',
    link: 'https://judo.how/o-goshi',
  });
  return {
    id: 'kyu7', kyu: 7, name: '7. Kyu – Gelb', subtitle: 'Test',
    bgColor: 'bg-yellow-400', textColor: 'text-yellow-900', techniques,
  };
}

function makeProgress(overrides: Partial<ProgressStats> = {}): ProgressStats {
  return {
    ...createEmptyProgress(),
    totalQuizzesCompleted: 3,
    totalAnswers: 10,
    totalCorrectAnswers: 8,
    bestScorePercentage: 100,
    ...overrides,
  };
}

async function answerAllCorrectly(user: ReturnType<typeof userEvent.setup>, count: number) {
  for (let i = 0; i < count; i++) {
    await user.click(screen.getAllByTestId('choice-correct')[0]);
    await user.click(screen.getByTestId('next-btn'));
  }
}

// ── rendering ─────────────────────────────────────────────────────────────────

describe('Quiz – rendering', () => {
  it('renders without crashing', () => {
    render(<Quiz grade={makeGrade()} onBack={vi.fn()} />);
    expect(screen.getByTestId('question')).toBeInTheDocument();
  });

  it('shows exactly 4 answer choices', () => {
    render(<Quiz grade={makeGrade()} onBack={vi.fn()} />);
    expect(within(screen.getByTestId('choices')).getAllByRole('button')).toHaveLength(4);
  });

  it('shows progress counter starting at 1', () => {
    render(<Quiz grade={makeGrade(5)} onBack={vi.fn()} />);
    expect(screen.getByTestId('progress').textContent).toMatch(/^1 \/ 5/);
  });

  it('shows initial score of 0', () => {
    render(<Quiz grade={makeGrade()} onBack={vi.fn()} />);
    expect(screen.getByTestId('score').textContent).toContain('0');
  });

  it('does not show the next button before answering', () => {
    render(<Quiz grade={makeGrade()} onBack={vi.fn()} />);
    expect(screen.queryByTestId('next-btn')).not.toBeInTheDocument();
  });
});

// ── answering ─────────────────────────────────────────────────────────────────

describe('Quiz – answering', () => {
  it('shows next button after selecting any answer', async () => {
    const user = userEvent.setup();
    render(<Quiz grade={makeGrade()} onBack={vi.fn()} />);
    await user.click(screen.getAllByRole('button', { name: /Term|Meaning|Hüfte/i })[0]);
    expect(screen.getByTestId('next-btn')).toBeInTheDocument();
  });

  it('increments score when correct answer is selected', async () => {
    const user = userEvent.setup();
    render(<Quiz grade={makeGrade()} onBack={vi.fn()} />);
    await user.click(screen.getAllByTestId('choice-correct')[0]);
    expect(screen.getByTestId('score').textContent).toContain('1');
  });

  it('does not increment score when wrong answer is selected', async () => {
    const user = userEvent.setup();
    render(<Quiz grade={makeGrade()} onBack={vi.fn()} />);
    const wrongBtns = screen.queryAllByTestId('choice-wrong');
    if (wrongBtns.length > 0) {
      await user.click(wrongBtns[0]);
      expect(screen.getByTestId('score').textContent).toContain('0');
    }
  });

  it('does not allow re-answering after an answer is selected', async () => {
    const user = userEvent.setup();
    render(<Quiz grade={makeGrade()} onBack={vi.fn()} />);
    const correctBtn = screen.getAllByTestId('choice-correct')[0];
    await user.click(correctBtn);
    await user.click(correctBtn);
    expect(screen.getByTestId('score').textContent).toContain('1');
  });

  it('shows hint after answering when comment is present', async () => {
    const user = userEvent.setup();
    const grade: Grade = {
      id: 'g', kyu: 7, name: 'Test', subtitle: '', bgColor: '', textColor: '',
      techniques: Array.from({ length: 5 }, (_, i) =>
        makeTechnique({ id: `t${i}`, term: `T${i}`, meaning: `M${i}`, comment: 'Tipp für alle' })
      ),
    };
    render(<Quiz grade={grade} onBack={vi.fn()} />);
    await user.click(screen.getAllByRole('button', { name: /T|M/i })[0]);
    expect(screen.getByTestId('hint')).toBeInTheDocument();
  });
});

// ── navigation ────────────────────────────────────────────────────────────────

describe('Quiz – navigation', () => {
  it('advances to the next question when "Weiter" is clicked', async () => {
    const user = userEvent.setup();
    render(<Quiz grade={makeGrade(5)} onBack={vi.fn()} />);
    await user.click(screen.getAllByTestId('choice-correct')[0]);
    await user.click(screen.getByTestId('next-btn'));
    expect(screen.getByTestId('progress').textContent).toMatch(/^2 \/ 5/);
  });

  it('shows "Ergebnis anzeigen" label on the last question', async () => {
    const user = userEvent.setup();
    render(<Quiz grade={makeGrade(2)} onBack={vi.fn()} />);
    await user.click(screen.getAllByTestId('choice-correct')[0]);
    await user.click(screen.getByTestId('next-btn'));
    await user.click(screen.getAllByTestId('choice-correct')[0]);
    expect(screen.getByTestId('next-btn').textContent).toBe('Ergebnis anzeigen');
  });

  it('calls onBack when the back button is clicked', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<Quiz grade={makeGrade()} onBack={onBack} />);
    await user.click(screen.getByText(/Zurück/));
    expect(onBack).toHaveBeenCalledOnce();
  });
});

// ── score screen ──────────────────────────────────────────────────────────────

describe('Quiz – score screen', () => {
  it('shows the score screen after the last question', async () => {
    const user = userEvent.setup();
    const grade = makeGrade(3);
    render(<Quiz grade={grade} onBack={vi.fn()} />);
    await answerAllCorrectly(user, grade.techniques.length);
    expect(screen.getByText('Quiz beendet!')).toBeInTheDocument();
  });

  it('shows 100% when all answers are correct', async () => {
    const user = userEvent.setup();
    const grade = makeGrade(3);
    render(<Quiz grade={grade} onBack={vi.fn()} />);
    await answerAllCorrectly(user, grade.techniques.length);
    expect(screen.getByTestId('score-pct').textContent).toBe('100%');
  });

  it('shows 🏆 emoji for 100%', async () => {
    const user = userEvent.setup();
    const grade = makeGrade(3);
    render(<Quiz grade={grade} onBack={vi.fn()} />);
    await answerAllCorrectly(user, grade.techniques.length);
    expect(screen.getByTestId('score-emoji').textContent).toBe('🏆');
  });

  it('shows correct "X von Y richtig" summary text', async () => {
    const user = userEvent.setup();
    const grade = makeGrade(3);
    render(<Quiz grade={grade} onBack={vi.fn()} />);
    await answerAllCorrectly(user, grade.techniques.length);
    expect(screen.getByTestId('score-text').textContent).toMatch(/3 von 3/);
  });

  it('calls onBack when "Nochmal üben" is clicked on the score screen', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<Quiz grade={makeGrade(2)} onBack={onBack} />);
    await answerAllCorrectly(user, 2);
    await user.click(screen.getByText('Nochmal üben'));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('calls onComplete with quiz summary and per-technique answer results', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const grade = makeGrade(2);
    render(<Quiz grade={grade} onBack={vi.fn()} onComplete={onComplete} />);

    await answerAllCorrectly(user, grade.techniques.length);

    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete.mock.calls[0][0]).toMatchObject({
      gradeId: 'kyu7',
      gradeName: '7. Kyu – Gelb',
      score: 2,
      totalQuestions: 2,
      answers: [
        { correct: true },
        { correct: true },
      ],
    });
  });

  it('shows German learning stats on the score screen when progress is available', async () => {
    const user = userEvent.setup();
    render(<Quiz grade={makeGrade(2)} progress={makeProgress()} onBack={vi.fn()} />);

    await answerAllCorrectly(user, 2);

    expect(screen.getByTestId('score-stats-summary')).toHaveTextContent('Dein Lernstand');
    expect(screen.getByTestId('score-stats-summary')).toHaveTextContent(
      'Insgesamt 3 Quiz abgeschlossen, 80% richtig.'
    );
    expect(screen.getByTestId('score-stats-summary')).toHaveTextContent('Bestwert: 100%');
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

describe('Quiz – Judo-Werte', () => {
  it('shows "Welcher Begriff ist ein Judo-Wert?" as question', () => {
    render(<Quiz grade={makeWertGrade()} onBack={vi.fn()} />);
    expect(screen.getByTestId('question').textContent).toBe('Welcher Begriff ist ein Judo-Wert?');
  });

  it('shows "Judo-Wert erkennen" label', () => {
    render(<Quiz grade={makeWertGrade()} onBack={vi.fn()} />);
    expect(screen.getByTestId('question-label').textContent).toBe('Judo-Wert erkennen');
  });

  it('correct answer is the value term', () => {
    render(<Quiz grade={makeWertGrade()} onBack={vi.fn()} />);
    const correct = screen.getAllByTestId('choice-correct')[0];
    const werte = ['Respekt', 'Mut', 'Ehrlichkeit', 'Höflichkeit'];
    expect(werte).toContain(correct.textContent?.trim());
  });

  it('shows meaning as hint after answering', async () => {
    const user = userEvent.setup();
    render(<Quiz grade={makeWertGrade()} onBack={vi.fn()} />);
    await user.click(screen.getAllByTestId('choice-correct')[0]);
    expect(screen.getByTestId('hint')).toBeInTheDocument();
  });
});

// ── image-to-name question type ───────────────────────────────────────────────

function makeImageGrade(): Grade {
  // All techniques have images so assignQuestionType will randomly pick — we
  // force image-to-name by making the grade techniques-only-with-images and
  // relying on the fact that the correct testid is always present regardless.
  const techniques: Technique[] = [
    { id: 'o-goshi', term: 'O-Goshi', meaning: 'Große Hüfte', category: 'Koshi-Waza', introducedAt: 7, imageUrl: 'https://example.com/o-goshi.jpg' },
    { id: 'uchi-mata', term: 'Uchi-Mata', meaning: 'Innerer Schenkelwurf', category: 'Ashi-Waza', introducedAt: 5, imageUrl: 'https://example.com/uchi-mata.jpg' },
    { id: 'tai-otoshi', term: 'Tai-Otoshi', meaning: 'Körpersturz', category: 'Te-Waza', introducedAt: 7, imageUrl: 'https://example.com/tai-otoshi.jpg' },
    { id: 'harai-goshi', term: 'Harai-Goshi', meaning: 'Hüftfeger', category: 'Koshi-Waza', introducedAt: 5, imageUrl: 'https://example.com/harai-goshi.jpg' },
  ];
  return { id: 'kyu7', kyu: 7, name: '7. Kyu', subtitle: 'Test', bgColor: '', textColor: '', techniques };
}

describe('Quiz – image questions', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows 4 choices regardless of question type', () => {
    render(<Quiz grade={makeImageGrade()} onBack={vi.fn()} />);
    expect(within(screen.getByTestId('choices')).getAllByRole('button')).toHaveLength(4);
  });

  it('score increments on correct answer for image-based questions', async () => {
    const user = userEvent.setup();
    render(<Quiz grade={makeImageGrade()} onBack={vi.fn()} />);
    await user.click(screen.getAllByTestId('choice-correct')[0]);
    expect(screen.getByTestId('score').textContent).toContain('1');
  });

  it('image shown before answering when question type is image-to-name', () => {
    // Run a few times to increase probability of hitting an image-to-name question
    // (50/50 random — at least one render out of several will show the image before)
    let found = false;
    for (let i = 0; i < 20 && !found; i++) {
      const { unmount } = render(<Quiz grade={makeImageGrade()} onBack={vi.fn()} />);
      if (screen.queryByTestId('technique-image-before')) found = true;
      unmount();
    }
    expect(found).toBe(true);
  });

  it('image shown after answering when question type is term-to-meaning', async () => {
    const user = userEvent.setup();
    let found = false;
    for (let i = 0; i < 20 && !found; i++) {
      const { unmount } = render(<Quiz grade={makeImageGrade()} onBack={vi.fn()} />);
      if (!screen.queryByTestId('technique-image-before')) {
        // This is a term-to-meaning question — image should appear after answering
        await user.click(screen.getAllByTestId('choice-correct')[0]);
        if (screen.queryByTestId('technique-image-after')) found = true;
      }
      unmount();
    }
    expect(found).toBe(true);
  });

  it('does not show image-required questions while offline', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    vi.spyOn(Math, 'random').mockReturnValue(0);

    render(<Quiz grade={makeImageGrade()} onBack={vi.fn()} />);

    expect(screen.getByTestId('question-label')).toHaveTextContent('Was bedeutet…?');
    expect(screen.queryByTestId('technique-image-before')).not.toBeInTheDocument();
  });
});

// ── deterministic question-type tests via mocked assignQuestionType ───────────

function makeImageGradeSingle(): Grade {
  const techniques: Technique[] = [
    { id: 'o-goshi', term: 'O-Goshi', meaning: 'Große Hüfte', category: 'Koshi-Waza', introducedAt: 7, imageUrl: 'https://example.com/o-goshi.jpg' },
    { id: 'uchi-mata', term: 'Uchi-Mata', meaning: 'Innerer Schenkelwurf', category: 'Ashi-Waza', introducedAt: 5, imageUrl: 'https://example.com/uchi-mata.jpg' },
    { id: 'tai-otoshi', term: 'Tai-Otoshi', meaning: 'Körpersturz', category: 'Te-Waza', introducedAt: 7, imageUrl: 'https://example.com/tai-otoshi.jpg' },
    { id: 'harai-goshi', term: 'Harai-Goshi', meaning: 'Hüftfeger', category: 'Koshi-Waza', introducedAt: 5, imageUrl: 'https://example.com/harai-goshi.jpg' },
  ];
  return { id: 'kyu7', kyu: 7, name: '7. Kyu', subtitle: 'Test', bgColor: '', textColor: '', techniques };
}

describe('Quiz – image-to-name (deterministic)', () => {
  beforeEach(() => { _forcedQuestionType = 'image-to-name'; });
  afterEach(() => { _forcedQuestionType = null; });

  it('shows "Welche Technik ist das?" as question text', () => {
    render(<Quiz grade={makeImageGradeSingle()} onBack={vi.fn()} />);
    expect(screen.getByTestId('question').textContent).toBe('Welche Technik ist das?');
  });

  it('shows "Welche Technik ist das?" as question label', () => {
    render(<Quiz grade={makeImageGradeSingle()} onBack={vi.fn()} />);
    expect(screen.getByTestId('question-label').textContent).toBe('Welche Technik ist das?');
  });

  it('correct answer is the Japanese term', () => {
    render(<Quiz grade={makeImageGradeSingle()} onBack={vi.fn()} />);
    const correct = screen.getAllByTestId('choice-correct')[0];
    const terms = makeImageGradeSingle().techniques.map((t) => t.term);
    expect(terms).toContain(correct.textContent?.trim());
  });

  it('shows German meaning as hint after answering', async () => {
    const user = userEvent.setup();
    render(<Quiz grade={makeImageGradeSingle()} onBack={vi.fn()} />);
    await user.click(screen.getAllByTestId('choice-correct')[0]);
    const hint = screen.getByTestId('hint');
    const meanings = makeImageGradeSingle().techniques.map((t) => t.meaning);
    expect(meanings.some((m) => hint.textContent?.includes(m))).toBe(true);
  });
});

describe('Quiz – term-to-meaning (deterministic)', () => {
  beforeEach(() => { _forcedQuestionType = 'term-to-meaning'; });
  afterEach(() => { _forcedQuestionType = null; });

  it('shows "Was bedeutet…?" as question label', () => {
    render(<Quiz grade={makeGrade()} onBack={vi.fn()} />);
    expect(screen.getByTestId('question-label').textContent).toBe('Was bedeutet…?');
  });

  it('shows the Japanese term as question text', () => {
    render(<Quiz grade={makeGrade()} onBack={vi.fn()} />);
    const questionText = screen.getByTestId('question').textContent ?? '';
    const terms = makeGrade().techniques.map((t) => t.term);
    expect(terms).toContain(questionText);
  });

  it('correct answer is the German meaning', () => {
    render(<Quiz grade={makeGrade()} onBack={vi.fn()} />);
    const correct = screen.getAllByTestId('choice-correct')[0];
    const meanings = makeGrade().techniques.map((t) => t.meaning);
    expect(meanings).toContain(correct.textContent?.trim());
  });
});
