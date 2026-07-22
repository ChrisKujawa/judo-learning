import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { InstallPrompt } from './InstallPrompt';

async function dispatchBeforeInstallPrompt({
  prompt = vi.fn().mockResolvedValue(undefined),
  userChoice = Promise.resolve({ outcome: 'accepted' as const, platform: 'web' }),
} = {}) {
  const event = new Event('beforeinstallprompt', { cancelable: true }) as Event & {
    prompt: typeof prompt;
    userChoice: Promise<{ outcome: 'accepted'; platform: string }>;
  };
  event.prompt = prompt;
  event.userChoice = userChoice;

  await act(async () => {
    window.dispatchEvent(event);
  });

  return event;
}

function InstallPromptHarness() {
  const installPrompt = useInstallPrompt();
  return <InstallPrompt {...installPrompt} />;
}

describe('InstallPrompt', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('stays hidden until the browser exposes an install prompt', () => {
    render(<InstallPrompt canInstall={false} onInstall={vi.fn()} />);

    expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument();
  });

  it('renders safely when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);

    render(<InstallPromptHarness />);

    expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument();
  });

  it('shows German install UI after beforeinstallprompt', async () => {
    render(<InstallPromptHarness />);

    await dispatchBeforeInstallPrompt();

    expect(screen.getByTestId('install-prompt')).toHaveTextContent('Als App installieren');
    expect(screen.getByTestId('install-prompt')).toHaveTextContent('Speichere Judo Lernen');
    expect(screen.getByTestId('install-btn')).toHaveTextContent('App installieren');
  });

  it('starts the deferred browser prompt when the install button is clicked', async () => {
    const user = userEvent.setup();
    render(<InstallPromptHarness />);
    const installEvent = await dispatchBeforeInstallPrompt();

    await user.click(screen.getByTestId('install-btn'));

    expect(installEvent.defaultPrevented).toBe(true);
    expect(installEvent.prompt).toHaveBeenCalledOnce();
    expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument();
  });

  it('handles rejected browser install prompts without an unhandled rejection', async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const prompt = vi.fn().mockRejectedValue(new Error('Prompt rejected'));
    render(<InstallPromptHarness />);
    await dispatchBeforeInstallPrompt({ prompt });

    await user.click(screen.getByTestId('install-btn'));

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'App-Installation konnte nicht gestartet werden.',
        expect.any(Error)
      );
    });
  });
});
