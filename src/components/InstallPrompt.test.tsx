import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
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
});
