import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CONTACT_EMAIL, FEEDBACK_URL, InfoScreen, REPOSITORY_URL } from './InfoScreen';

describe('InfoScreen', () => {
  it('starts at the top so feedback is immediately visible', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    render(<InfoScreen onBack={vi.fn()} />);

    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    scrollTo.mockRestore();
  });

  it('shows feedback, privacy, and operator information', () => {
    render(<InfoScreen onBack={vi.fn()} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Über Judo Lernen' })).toBeInTheDocument();
    expect(screen.getByTestId('privacy-notice')).toHaveTextContent('Hosting über GitHub Pages');
    expect(screen.getByTestId('privacy-notice')).toHaveTextContent(
      'Reichweitenmessung mit GoatCounter'
    );
    expect(screen.getByTestId('privacy-notice')).toHaveTextContent('Christopher Kujawa');
    expect(screen.getByTestId('imprint')).toHaveTextContent('Christopher Kujawa');
    expect(screen.getByTestId('imprint')).toHaveTextContent('c/o Sport-Dojo Berlin e.V.');
    expect(screen.getByTestId('imprint')).toHaveTextContent('Boizenburger Str. 6');
    expect(screen.getByTestId('imprint')).toHaveTextContent('§ 18 Abs. 1 MStV');
    expect(screen.getByTestId('imprint')).toHaveTextContent(CONTACT_EMAIL);
    expect(screen.queryByRole('link', { name: CONTACT_EMAIL })).not.toBeInTheDocument();
    expect(screen.getByTestId('imprint')).not.toHaveTextContent('§ 5 DDG');
  });

  it('links to prefilled feedback and the source repository', () => {
    render(<InfoScreen onBack={vi.fn()} />);

    expect(screen.getByTestId('feedback-link')).toHaveAttribute('href', FEEDBACK_URL);
    expect(screen.getByTestId('feedback-link')).toHaveAttribute('target', '_blank');
    expect(screen.getByTestId('repository-link')).toHaveAttribute('href', REPOSITORY_URL);
    expect(screen.getByTestId('repository-link')).toHaveAttribute('target', '_blank');
  });

  it('handles back navigation and external link analytics', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    const onFeedback = vi.fn();
    const onRepository = vi.fn();
    render(
      <InfoScreen
        onBack={onBack}
        onFeedback={onFeedback}
        onRepository={onRepository}
      />
    );
    screen.getByTestId('feedback-link').addEventListener('click', (event) => event.preventDefault());
    screen.getByTestId('repository-link').addEventListener('click', (event) => event.preventDefault());

    await user.click(screen.getByRole('button', { name: '← Zurück' }));
    await user.click(screen.getByTestId('feedback-link'));
    await user.click(screen.getByTestId('repository-link'));

    expect(onBack).toHaveBeenCalledOnce();
    expect(onFeedback).toHaveBeenCalledOnce();
    expect(onRepository).toHaveBeenCalledOnce();
  });
});
