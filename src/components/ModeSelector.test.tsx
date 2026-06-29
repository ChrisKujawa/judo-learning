import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModeSelector } from '../components/ModeSelector';
import type { Grade, Technique } from '../data/types';

function makeTechnique(id: string, overrides: Partial<Technique> = {}): Technique {
  return { id, term: `Term ${id}`, meaning: `Meaning ${id}`, category: 'Test', introducedAt: 7, ...overrides };
}

function makeGrade(techniqueCount = 5, withImages = false): Grade {
  return {
    id: 'kyu7',
    kyu: 7,
    name: '7. Kyu – Gelb',
    subtitle: 'Fallen, Werfen, Halten',
    bgColor: 'bg-yellow-400',
    textColor: 'text-yellow-900',
    techniques: Array.from({ length: techniqueCount }, (_, i) =>
      makeTechnique(`t${i}`, withImages ? { imageUrl: 'https://example.com/img.jpg' } : {})
    ),
  };
}

describe('ModeSelector', () => {
  it('renders the grade name', () => {
    render(<ModeSelector grade={makeGrade()} onSelectMode={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText('7. Kyu – Gelb')).toBeInTheDocument();
  });

  it('displays correct technique count', () => {
    render(<ModeSelector grade={makeGrade(12)} onSelectMode={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByTestId('technique-count').textContent).toBe('12 Begriffe');
  });

  it('calls onSelectMode with "term-to-meaning" when JP→DE button is clicked', async () => {
    const user = userEvent.setup();
    const onSelectMode = vi.fn();
    render(<ModeSelector grade={makeGrade()} onSelectMode={onSelectMode} onBack={vi.fn()} />);
    await user.click(screen.getByTestId('mode-btn-term-to-meaning'));
    expect(onSelectMode).toHaveBeenCalledWith('term-to-meaning');
  });

  it('calls onSelectMode with "meaning-to-term" when DE→JP button is clicked', async () => {
    const user = userEvent.setup();
    const onSelectMode = vi.fn();
    render(<ModeSelector grade={makeGrade()} onSelectMode={onSelectMode} onBack={vi.fn()} />);
    await user.click(screen.getByTestId('mode-btn-meaning-to-term'));
    expect(onSelectMode).toHaveBeenCalledWith('meaning-to-term');
  });

  it('calls onBack when the back button is clicked', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<ModeSelector grade={makeGrade()} onSelectMode={vi.fn()} onBack={onBack} />);
    await user.click(screen.getByText(/Zurück/));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('shows mode description labels', () => {
    render(<ModeSelector grade={makeGrade()} onSelectMode={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText('Japanisch → Deutsch')).toBeInTheDocument();
    expect(screen.getByText('Deutsch → Japanisch')).toBeInTheDocument();
  });

  it('does NOT show pictogram mode button when no techniques have images', () => {
    render(<ModeSelector grade={makeGrade(5, false)} onSelectMode={vi.fn()} onBack={vi.fn()} />);
    expect(screen.queryByTestId('mode-btn-pictogram')).not.toBeInTheDocument();
  });

  it('shows pictogram mode button when grade has techniques with images', () => {
    render(<ModeSelector grade={makeGrade(5, true)} onSelectMode={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByTestId('mode-btn-pictogram')).toBeInTheDocument();
  });

  it('calls onSelectMode with "pictogram" when Bildquiz button is clicked', async () => {
    const user = userEvent.setup();
    const onSelectMode = vi.fn();
    render(<ModeSelector grade={makeGrade(5, true)} onSelectMode={onSelectMode} onBack={vi.fn()} />);
    await user.click(screen.getByTestId('mode-btn-pictogram'));
    expect(onSelectMode).toHaveBeenCalledWith('pictogram');
  });
});
