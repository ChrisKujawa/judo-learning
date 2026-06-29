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
});
