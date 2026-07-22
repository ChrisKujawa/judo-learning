import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptChoice {
  outcome: 'accepted' | 'dismissed';
  platform: string;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<BeforeInstallPromptChoice>;
  prompt(): Promise<void>;
}

type StandaloneNavigator = Navigator & {
  standalone?: boolean;
};

export interface InstallPromptControls {
  canInstall: boolean;
  onInstall: () => Promise<void>;
}

function isStandalone() {
  return (
    Boolean(window.matchMedia?.('(display-mode: standalone)')?.matches) ||
    Boolean((window.navigator as StandaloneNavigator).standalone)
  );
}

export function useInstallPrompt(): InstallPromptControls {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => isStandalone());

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const onInstall = useCallback(async () => {
    const promptEvent = installPrompt;
    if (!promptEvent) return;

    setInstallPrompt(null);
    await promptEvent.prompt();
    await promptEvent.userChoice;
  }, [installPrompt]);

  return {
    canInstall: !installed && installPrompt !== null,
    onInstall,
  };
}
