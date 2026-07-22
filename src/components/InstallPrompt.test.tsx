import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InstallPrompt } from './InstallPrompt';

async function dispatchBeforeInstallPrompt() {
  const event = new Event('beforeinstallprompt', { cancelable: true }) as Event & {
    prompt: ReturnType<typeof vi.fn>;
    userChoice: Promise<{ outcome: 'accepted'; platform: string }>;
  };
  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });

  await act(async () => {
    window.dispatchEvent(event);
  });

  return event;
}

describe('InstallPrompt', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('stays hidden until the browser exposes an install prompt', () => {
    render(<InstallPrompt />);

    expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument();
  });

  it('renders safely when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);

    render(<InstallPrompt />);

    expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument();
  });

  it('shows German install UI after beforeinstallprompt', async () => {
    render(<InstallPrompt />);

    await dispatchBeforeInstallPrompt();

    expect(screen.getByTestId('install-prompt')).toHaveTextContent('Als App installieren');
    expect(screen.getByTestId('install-prompt')).toHaveTextContent('Speichere Judo Lernen');
    expect(screen.getByTestId('install-btn')).toHaveTextContent('App installieren');
  });

  it('starts the deferred browser prompt when the install button is clicked', async () => {
    const user = userEvent.setup();
    render(<InstallPrompt />);
    const installEvent = await dispatchBeforeInstallPrompt();

    await user.click(screen.getByTestId('install-btn'));

    expect(installEvent.defaultPrevented).toBe(true);
    expect(installEvent.prompt).toHaveBeenCalledOnce();
    expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument();
  });
});
