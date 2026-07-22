import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GradeSelector } from '../components/GradeSelector';
import type { Grade } from '../data/types';
import { createEmptyProgress, type ProgressStats } from '../utils/progress';

function makeGrade(overrides: Partial<Grade> = {}): Grade {
  return {
    id: 'kyu7',
    kyu: 7,
    name: '7. Kyu – Gelb',
    subtitle: 'Fallen, Werfen, Halten',
    bgColor: 'bg-yellow-400',
    textColor: 'text-yellow-900',
    techniques: [],
    ...overrides,
  };
}

function makeProgress(overrides: Partial<ProgressStats> = {}): ProgressStats {
  return {
    ...createEmptyProgress(),
    totalQuizzesCompleted: 2,
    totalAnswers: 8,
    totalCorrectAnswers: 6,
    bestScorePercentage: 88,
    latestSelectedGradeId: 'kyu7',
    latestCompletedQuiz: {
      gradeId: 'kyu7',
      gradeName: '7. Kyu - Gelb',
      completedAt: '2026-07-22T19:00:00.000Z',
      score: 3,
      totalQuestions: 4,
      percentage: 75,
    },
    grades: {
      kyu7: {
        quizzesCompleted: 2,
        totalAnswers: 8,
        totalCorrectAnswers: 6,
        bestScorePercentage: 88,
      },
    },
    ...overrides,
  };
}

describe('GradeSelector', () => {
  it('renders the app title', () => {
    render(<GradeSelector grades={[]} onSelect={vi.fn()} />);
    expect(screen.getByText('Judo Lernen')).toBeInTheDocument();
  });

  it('renders a button for each grade', () => {
    const grades = [makeGrade(), makeGrade({ id: 'kyu6', name: '6. Kyu – Gelb-Orange' })];
    render(<GradeSelector grades={grades} onSelect={vi.fn()} />);
    expect(screen.getByText('7. Kyu – Gelb')).toBeInTheDocument();
    expect(screen.getByText('6. Kyu – Gelb-Orange')).toBeInTheDocument();
  });

  it('renders the subtitle of each grade', () => {
    render(<GradeSelector grades={[makeGrade()]} onSelect={vi.fn()} />);
    expect(screen.getByText('Fallen, Werfen, Halten')).toBeInTheDocument();
  });

  it('calls onSelect with the correct grade when a button is clicked', async () => {
    const user = userEvent.setup();
    const grade = makeGrade();
    const onSelect = vi.fn();
    render(<GradeSelector grades={[grade]} onSelect={onSelect} />);
    await user.click(screen.getByTestId('grade-btn-kyu7'));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(grade);
  });

  it('renders no grade buttons when grades array is empty', () => {
    render(<GradeSelector grades={[]} onSelect={vi.fn()} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders all 8 real grades without crashing', async () => {
    const { grades } = await import('../data/grades');
    render(<GradeSelector grades={grades} onSelect={vi.fn()} />);
    expect(screen.getAllByRole('button')).toHaveLength(8);
  });

  it('renders compact German learning stats when progress is provided', () => {
    render(<GradeSelector grades={[makeGrade()]} progress={makeProgress()} onSelect={vi.fn()} />);

    expect(screen.getByTestId('stats-summary')).toHaveTextContent('Dein Lernstand');
    expect(screen.getByTestId('stats-total-quizzes')).toHaveTextContent('2');
    expect(screen.getByTestId('stats-total-accuracy')).toHaveTextContent('75%');
    expect(screen.getByTestId('stats-best-score')).toHaveTextContent('88%');
    expect(screen.getByTestId('latest-selected-grade')).toHaveTextContent('Zuletzt gewählt: 7. Kyu');
    expect(screen.getByTestId('latest-completed-quiz')).toHaveTextContent('Letztes Quiz: 7. Kyu - Gelb');
  });

  it('renders per-grade progress on grade buttons', () => {
    render(<GradeSelector grades={[makeGrade()]} progress={makeProgress()} onSelect={vi.fn()} />);

    expect(screen.getByTestId('grade-stats-kyu7')).toHaveTextContent('2 Quiz, 75% richtig');
  });

  it('renders an empty stats message before the first completed quiz', () => {
    render(
      <GradeSelector
        grades={[makeGrade()]}
        progress={createEmptyProgress()}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByTestId('stats-empty')).toHaveTextContent('Noch kein Quiz abgeschlossen.');
    expect(screen.getByTestId('reset-progress-btn')).toBeDisabled();
  });

  it('calls onResetProgress when reset is clicked', async () => {
    const user = userEvent.setup();
    const onResetProgress = vi.fn();
    render(
      <GradeSelector
        grades={[makeGrade()]}
        progress={makeProgress()}
        onSelect={vi.fn()}
        onResetProgress={onResetProgress}
      />
    );

    await user.click(screen.getByTestId('reset-progress-btn'));

    expect(onResetProgress).toHaveBeenCalledOnce();
  });

  it('disables reset when no reset handler is provided', () => {
    render(<GradeSelector grades={[makeGrade()]} progress={makeProgress()} onSelect={vi.fn()} />);

    expect(screen.getByTestId('reset-progress-btn')).toBeDisabled();
  });
});
