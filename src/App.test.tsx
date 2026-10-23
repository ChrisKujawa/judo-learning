import { beforeEach, describe, it, expect, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { trackAnalyticsEvent } from './analytics';
import App from './App';
import { PROGRESS_STORAGE_KEY, createEmptyProgress } from './utils/progress';
import { QUIZ_QUESTION_LIMIT } from './utils/quiz';

vi.mock('./analytics', () => ({
  trackAnalyticsEvent: vi.fn(),
}));

describe('App – integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(trackAnalyticsEvent).mockClear();
  });

  it('shows the GradeSelector (home screen) on initial render', () => {
    render(<App />);
    expect(screen.getByText('Judo Lernen')).toBeInTheDocument();
  });

  it('shows grade buttons on the home screen', () => {
    render(<App />);
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('navigates directly to Quiz when a grade is selected', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId('grade-btn-kyu8'));
    expect(screen.getByTestId('question')).toBeInTheDocument();
  });

  it('navigates to the glossary and back to the home screen', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId('open-glossary-btn'));
    expect(screen.getByRole('heading', { level: 1, name: 'Judo-Lexikon' })).toBeInTheDocument();
    expect(screen.getByTestId('glossary-entry-o-goshi')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '← Zurück' }));
    expect(screen.getByText('Judo Lernen')).toBeInTheDocument();
  });

  it('opens app information, tracks its links, and returns home', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId('open-info-btn'));

    expect(screen.getByTestId('info-screen')).toBeInTheDocument();
    expect(trackAnalyticsEvent).toHaveBeenCalledWith({
      path: 'info-opened',
      title: 'App information opened',
    });

    screen.getByTestId('feedback-link').addEventListener('click', (event) => event.preventDefault());
    screen.getByTestId('repository-link').addEventListener('click', (event) => event.preventDefault());
    await user.click(screen.getByTestId('feedback-link'));
    await user.click(screen.getByTestId('repository-link'));

    expect(trackAnalyticsEvent).toHaveBeenCalledWith({
      path: 'feedback-opened',
      title: 'Feedback opened',
    });
    expect(trackAnalyticsEvent).toHaveBeenCalledWith({
      path: 'repository-opened',
      title: 'Repository opened',
    });

    await user.click(screen.getByRole('button', { name: '← Zurück' }));
    expect(screen.getByText('Judo Lernen')).toBeInTheDocument();
  });

  it('restores keyboard focus to the home information opener', async () => {
    const user = userEvent.setup();
    render(<App />);
    const opener = screen.getByTestId('open-info-btn');
    opener.focus();

    await user.keyboard('{Enter}');

    const backButton = screen.getByRole('button', { name: '← Zurück' });
    expect(backButton).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(opener).toHaveFocus();
  });

  it('keeps an in-progress quiz mounted while app information is open', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId('grade-btn-kyu8'));
    await user.click(screen.getAllByTestId('choice-correct')[0]);
    await user.click(screen.getByTestId('next-btn'));
    expect(screen.getByTestId('progress')).toHaveTextContent(`2 / ${QUIZ_QUESTION_LIMIT}`);
    expect(screen.getByTestId('score')).toHaveTextContent('1');

    const opener = screen.getByTestId('open-info-floating-btn');
    opener.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByTestId('info-screen')).toBeInTheDocument();

    const backButton = screen.getByRole('button', { name: '← Zurück' });
    expect(backButton).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(screen.getByTestId('progress')).toHaveTextContent(`2 / ${QUIZ_QUESTION_LIMIT}`);
    expect(screen.getByTestId('score')).toHaveTextContent('1');
    expect(screen.getByTestId('open-info-floating-btn')).toHaveFocus();
  });

  it('keeps glossary detail state mounted while app information is open', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId('open-glossary-btn'));
    await user.click(screen.getByTestId('glossary-entry-o-goshi'));
    expect(screen.getByRole('heading', { level: 1, name: 'O-Goshi' })).toBeInTheDocument();

    await user.click(screen.getByTestId('open-info-floating-btn'));

    expect(screen.getByTestId('info-screen')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '← Zurück' }));

    expect(screen.getByRole('heading', { level: 1, name: 'O-Goshi' })).toBeInTheDocument();
    expect(screen.getByTestId('glossary-detail-back')).toBeInTheDocument();
  });

  it('shows progress counter after grade selection', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId('grade-btn-kyu8'));
    expect(screen.getByTestId('progress')).toBeInTheDocument();
  });

  it('navigates back to GradeSelector from Quiz via back button', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId('grade-btn-kyu8'));
    await user.click(screen.getByText(/Zurück/));
    expect(screen.getByText('Judo Lernen')).toBeInTheDocument();
  });

  it('can complete a full quiz flow without errors', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId('grade-btn-kyu8'));

    while (!screen.queryByText('Quiz beendet!')) {
      const correctBtn = screen.getAllByTestId('choice-correct')[0];
      await user.click(correctBtn);
      await user.click(screen.getByTestId('next-btn'));
    }
    expect(screen.getByText('Quiz beendet!')).toBeInTheDocument();
  });

  it('returns to GradeSelector when "Nochmal üben" is clicked after quiz', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId('grade-btn-kyu8'));

    while (!screen.queryByText('Quiz beendet!')) {
      await user.click(screen.getAllByTestId('choice-correct')[0]);
      await user.click(screen.getByTestId('next-btn'));
    }
    await user.click(screen.getByText('Nochmal üben'));
    expect(screen.getByText('Judo Lernen')).toBeInTheDocument();
  });

  it('loads persisted progress and renders German stats on the home screen', () => {
    localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        ...createEmptyProgress(),
        totalQuizzesCompleted: 1,
        totalAnswers: 4,
        totalCorrectAnswers: 3,
        bestScorePercentage: 75,
        latestSelectedGradeId: 'kyu8',
        grades: {
          kyu8: {
            quizzesCompleted: 1,
            totalAnswers: 4,
            totalCorrectAnswers: 3,
            bestScorePercentage: 75,
          },
        },
      })
    );

    render(<App />);

    expect(screen.getByTestId('stats-summary')).toHaveTextContent('Dein Lernstand');
    expect(screen.getByTestId('stats-total-quizzes')).toHaveTextContent('1');
    expect(screen.getByTestId('latest-selected-grade')).toHaveTextContent('Zuletzt gewählt: 8. Kyu');
    expect(screen.getByTestId('grade-stats-kyu8')).toHaveTextContent('1 Quiz, 75% richtig');
  });

  it('persists the latest selected grade locally', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId('grade-btn-kyu8'));

    expect(JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) ?? '{}')).toMatchObject({
      latestSelectedGradeId: 'kyu8',
    });
  });

  it('tracks the selected Kyu grade and quiz start', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId('grade-btn-kyu8'));

    expect(trackAnalyticsEvent).toHaveBeenNthCalledWith(1, {
      path: 'kyu-selected-kyu8',
      title: 'Kyu selected: 8. Kyu – Weiß-Gelb',
    });
    expect(trackAnalyticsEvent).toHaveBeenNthCalledWith(2, {
      path: 'quiz-started-kyu8',
      title: 'Quiz started: 8. Kyu – Weiß-Gelb',
    });
  });

  it('persists completed quiz stats locally', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId('grade-btn-kyu8'));
    while (!screen.queryByTestId('score-screen')) {
      await user.click(screen.getAllByTestId('choice-correct')[0]);
      await user.click(screen.getByTestId('next-btn'));
    }

    expect(JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) ?? '{}')).toMatchObject({
      totalQuizzesCompleted: 1,
      totalAnswers: QUIZ_QUESTION_LIMIT,
      totalCorrectAnswers: QUIZ_QUESTION_LIMIT,
      bestScorePercentage: 100,
      latestSelectedGradeId: 'kyu8',
      grades: {
        kyu8: {
          quizzesCompleted: 1,
          totalAnswers: QUIZ_QUESTION_LIMIT,
          totalCorrectAnswers: QUIZ_QUESTION_LIMIT,
          bestScorePercentage: 100,
        },
      },
    });
  });

  it('persists an answer before the quiz is completed', async () => {
    // Given
    const user = userEvent.setup();
    render(<App />);

    // When
    await user.click(screen.getByTestId('grade-btn-kyu8'));
    await user.click(screen.getAllByTestId('choice-correct')[0]);

    // Then
    expect(JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) ?? '{}')).toMatchObject({
      totalQuizzesCompleted: 0,
      totalAnswers: 1,
      totalCorrectAnswers: 1,
      grades: {
        kyu8: {
          quizzesCompleted: 0,
          totalAnswers: 1,
          totalCorrectAnswers: 1,
        },
      },
    });
  });

  it('continues the quiz when local progress cannot be persisted', async () => {
    // Given
    const user = userEvent.setup();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<App />);
    const originalStorage = window.localStorage;
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        setItem() {
          throw new Error('Storage blocked');
        },
      },
    });

    // When
    await user.click(screen.getByTestId('grade-btn-kyu8'));
    await user.click(screen.getAllByTestId('choice-correct')[0]);

    // Then
    expect(screen.getByTestId('score')).toHaveTextContent('1');
    expect(warn).toHaveBeenCalledWith(
      'Lernfortschritt konnte nicht gespeichert werden.',
      expect.any(Error)
    );
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: originalStorage,
    });
  });

  it('tracks completed quizzes with the Kyu grade and score percentage', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId('grade-btn-kyu8'));
    while (!screen.queryByTestId('score-screen')) {
      await user.click(screen.getAllByTestId('choice-correct')[0]);
      await user.click(screen.getByTestId('next-btn'));
    }

    expect(trackAnalyticsEvent).toHaveBeenCalledWith({
      path: 'quiz-finished-kyu8',
      title: 'Quiz finished: 8. Kyu – Weiß-Gelb (100%)',
    });
  });

  it('resets local progress from the home screen', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        ...createEmptyProgress(),
        totalQuizzesCompleted: 1,
        totalAnswers: 4,
        totalCorrectAnswers: 4,
        bestScorePercentage: 100,
      })
    );
    render(<App />);

    await user.click(screen.getByTestId('reset-progress-btn'));

    expect(localStorage.getItem(PROGRESS_STORAGE_KEY)).toBeNull();
    expect(screen.getByTestId('stats-empty')).toHaveTextContent('Noch kein Quiz abgeschlossen.');
  });

  it('keeps the install prompt available when the browser event fires during a quiz', async () => {
    const user = userEvent.setup();
    const installEvent = new Event('beforeinstallprompt', { cancelable: true }) as Event & {
      prompt: ReturnType<typeof vi.fn>;
      userChoice: Promise<{ outcome: 'accepted'; platform: string }>;
    };
    installEvent.prompt = vi.fn().mockResolvedValue(undefined);
    installEvent.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });

    render(<App />);
    await user.click(screen.getByTestId('grade-btn-kyu8'));

    await act(async () => {
      window.dispatchEvent(installEvent);
    });
    await user.click(screen.getByText(/Zurück/));

    expect(screen.getByTestId('install-prompt')).toHaveTextContent('Als App installieren');
  });
});
