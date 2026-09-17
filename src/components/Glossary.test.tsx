import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Glossary } from './Glossary';
import type { Technique } from '../data/types';

const techniques: Technique[] = [
  {
    id: 'o-goshi',
    term: 'O-Goshi',
    meaning: 'Große Hüfte',
    translation: 'O = groß, Goshi = Hüfte',
    category: 'Koshi-Waza',
    comment: 'Hüfte tief vor Uke bringen.',
    link: 'https://example.com/o-goshi',
    imageUrl: 'https://example.com/o-goshi.jpg',
    introducedAt: 7,
  },
  {
    id: 'rei',
    term: 'Rei',
    meaning: 'Verbeugung',
    category: 'Grundbegriffe',
    introducedAt: 8,
  },
  {
    id: 'seoi-nage',
    term: 'Seoi-Nage',
    meaning: 'Schulterwurf',
    translation: 'Seoi = auf dem Rücken tragen, Nage = Wurf',
    category: 'Te-Waza',
    introducedAt: 6,
  },
];

describe('Glossary', () => {
  it('renders all techniques alphabetically', () => {
    render(<Glossary techniques={techniques} onBack={vi.fn()} />);

    const entries = screen.getAllByTestId(/^glossary-entry-/);
    expect(entries).toHaveLength(3);
    expect(entries.map((entry) => entry.textContent)).toEqual([
      expect.stringContaining('O-Goshi'),
      expect.stringContaining('Rei'),
      expect.stringContaining('Seoi-Nage'),
    ]);
    expect(screen.getByText('3 Einträge')).toBeInTheDocument();
  });

  it('searches terms, meanings, and translations case-insensitively', async () => {
    const user = userEvent.setup();
    render(<Glossary techniques={techniques} onBack={vi.fn()} />);
    const search = screen.getByRole('searchbox', { name: 'Suchen' });

    await user.type(search, 'SCHULTERWURF');
    expect(screen.getByTestId('glossary-entry-seoi-nage')).toBeInTheDocument();
    expect(screen.queryByTestId('glossary-entry-o-goshi')).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'groß');
    expect(screen.getByTestId('glossary-entry-o-goshi')).toBeInTheDocument();
    expect(screen.getByText('1 Eintrag')).toBeInTheDocument();
  });

  it('filters by category and introduction Kyu', async () => {
    const user = userEvent.setup();
    render(<Glossary techniques={techniques} onBack={vi.fn()} />);

    await user.selectOptions(screen.getByRole('combobox', { name: 'Kategorie' }), 'Koshi-Waza');
    expect(screen.getByTestId('glossary-entry-o-goshi')).toBeInTheDocument();
    expect(screen.queryByTestId('glossary-entry-rei')).not.toBeInTheDocument();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Kategorie' }), '');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Eingeführt im' }), '8');
    expect(screen.getByTestId('glossary-entry-rei')).toBeInTheDocument();
    expect(screen.queryByTestId('glossary-entry-o-goshi')).not.toBeInTheDocument();
  });

  it('explains when no entries match', async () => {
    const user = userEvent.setup();
    render(<Glossary techniques={techniques} onBack={vi.fn()} />);

    await user.type(screen.getByRole('searchbox', { name: 'Suchen' }), 'nicht vorhanden');

    expect(screen.getByTestId('glossary-empty')).toHaveTextContent(
      'Keine passenden Einträge gefunden.'
    );
    expect(screen.getByText('0 Einträge')).toBeInTheDocument();
  });

  it('shows all available technique details', async () => {
    const user = userEvent.setup();
    render(<Glossary techniques={techniques} onBack={vi.fn()} />);

    await user.click(screen.getByTestId('glossary-entry-o-goshi'));

    expect(screen.getByRole('heading', { level: 1, name: 'O-Goshi' })).toBeInTheDocument();
    expect(screen.getByText('Große Hüfte')).toBeInTheDocument();
    expect(screen.getByText('O = groß, Goshi = Hüfte')).toBeInTheDocument();
    expect(screen.getByText('Hüfte tief vor Uke bringen.')).toBeInTheDocument();
    expect(screen.getByText('Ab 7. Kyu')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'O-Goshi Illustration' })).toHaveAttribute(
      'src',
      'https://example.com/o-goshi.jpg'
    );
    expect(screen.getByRole('link', { name: /Mehr erfahren/ })).toHaveAttribute(
      'href',
      'https://example.com/o-goshi'
    );
  });

  it('returns to the filtered list from a detail', async () => {
    const user = userEvent.setup();
    render(<Glossary techniques={techniques} onBack={vi.fn()} />);

    await user.type(screen.getByRole('searchbox', { name: 'Suchen' }), 'O-Goshi');
    await user.click(screen.getByTestId('glossary-entry-o-goshi'));
    await user.click(screen.getByTestId('glossary-detail-back'));

    expect(screen.getByRole('searchbox', { name: 'Suchen' })).toHaveValue('O-Goshi');
    expect(screen.getByText('1 Eintrag')).toBeInTheDocument();
  });

  it('calls onBack from the glossary list', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<Glossary techniques={techniques} onBack={onBack} />);

    await user.click(screen.getByRole('button', { name: '← Zurück' }));

    expect(onBack).toHaveBeenCalledOnce();
  });
});
