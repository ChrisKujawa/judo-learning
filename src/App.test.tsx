import { beforeEach, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { grades } from './data/grades';
import { PROGRESS_STORAGE_KEY, createEmptyProgress } from './utils/progress';

describe('App – integration', () => {
  beforeEach(() => {
    localStorage.clear();
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

  it('persists completed quiz stats locally', async () => {
    const user = userEvent.setup();
    const kyu8QuestionCount = grades.find((grade) => grade.id === 'kyu8')?.techniques.length;
    render(<App />);

    await user.click(screen.getByTestId('grade-btn-kyu8'));
    while (!screen.queryByTestId('score-screen')) {
      await user.click(screen.getAllByTestId('choice-correct')[0]);
      await user.click(screen.getByTestId('next-btn'));
    }

    expect(JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) ?? '{}')).toMatchObject({
      totalQuizzesCompleted: 1,
      totalAnswers: kyu8QuestionCount,
      totalCorrectAnswers: kyu8QuestionCount,
      bestScorePercentage: 100,
      latestSelectedGradeId: 'kyu8',
      grades: {
        kyu8: {
          quizzesCompleted: 1,
          totalAnswers: kyu8QuestionCount,
          totalCorrectAnswers: kyu8QuestionCount,
          bestScorePercentage: 100,
        },
      },
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
});
