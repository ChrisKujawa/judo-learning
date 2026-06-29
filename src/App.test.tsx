import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App – integration', () => {
  it('shows the GradeSelector (home screen) on initial render', () => {
    render(<App />);
    expect(screen.getByText('Judo Lernen')).toBeInTheDocument();
  });

  it('shows grade buttons on the home screen', () => {
    render(<App />);
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('navigates to ModeSelector when a grade is selected', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId('grade-btn-kyu8'));
    expect(screen.getByTestId('mode-btn-term-to-meaning')).toBeInTheDocument();
    expect(screen.getByTestId('mode-btn-meaning-to-term')).toBeInTheDocument();
  });

  it('shows the selected grade name in ModeSelector', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId('grade-btn-kyu7'));
    expect(screen.getByText('7. Kyu – Gelb')).toBeInTheDocument();
  });

  it('navigates to Quiz when a mode is selected (term-to-meaning)', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId('grade-btn-kyu8'));
    await user.click(screen.getByTestId('mode-btn-term-to-meaning'));
    expect(screen.getByTestId('question')).toBeInTheDocument();
  });

  it('navigates to Quiz when a mode is selected (meaning-to-term)', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId('grade-btn-kyu8'));
    await user.click(screen.getByTestId('mode-btn-meaning-to-term'));
    expect(screen.getByTestId('question')).toBeInTheDocument();
  });

  it('navigates back to GradeSelector from ModeSelector via back button', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId('grade-btn-kyu8'));
    await user.click(screen.getByText(/Zurück/));
    expect(screen.getByText('Judo Lernen')).toBeInTheDocument();
  });

  it('navigates back to ModeSelector from Quiz via back button', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId('grade-btn-kyu8'));
    await user.click(screen.getByTestId('mode-btn-term-to-meaning'));
    // Back from quiz
    await user.click(screen.getByText(/Zurück/));
    expect(screen.getByTestId('mode-btn-term-to-meaning')).toBeInTheDocument();
  });

  it('can complete a full quiz flow without errors', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId('grade-btn-kyu8'));
    await user.click(screen.getByTestId('mode-btn-term-to-meaning'));

    // Answer all questions with the correct choice
    while (!screen.queryByText('Quiz beendet!')) {
      const correctBtn = screen.getAllByTestId('choice-correct')[0];
      await user.click(correctBtn);
      await user.click(screen.getByTestId('next-btn'));
    }
    expect(screen.getByText('Quiz beendet!')).toBeInTheDocument();
  });

  it('returns to ModeSelector when "Nochmal üben" is clicked after quiz', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId('grade-btn-kyu8'));
    await user.click(screen.getByTestId('mode-btn-term-to-meaning'));

    while (!screen.queryByText('Quiz beendet!')) {
      await user.click(screen.getAllByTestId('choice-correct')[0]);
      await user.click(screen.getByTestId('next-btn'));
    }
    await user.click(screen.getByText('Nochmal üben'));
    expect(screen.getByTestId('mode-btn-term-to-meaning')).toBeInTheDocument();
  });
});
