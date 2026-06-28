import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GradeSelector } from '../components/GradeSelector';
import type { Grade } from '../data/types';

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
});
