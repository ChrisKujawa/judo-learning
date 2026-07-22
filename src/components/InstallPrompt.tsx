import { useEffect, useState } from 'react';

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

function isStandalone() {
  return (
    Boolean(window.matchMedia?.('(display-mode: standalone)')?.matches) ||
    Boolean((window.navigator as StandaloneNavigator).standalone)
  );
}

export function InstallPrompt() {
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

  if (installed || !installPrompt) return null;

  async function handleInstallClick() {
    const promptEvent = installPrompt;
    if (!promptEvent) return;

    setInstallPrompt(null);
    await promptEvent.prompt();
    await promptEvent.userChoice;
  }

  return (
    <section
      className="w-full max-w-sm bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-left"
      data-testid="install-prompt"
    >
      <h2 className="text-base font-bold text-green-900">Als App installieren</h2>
      <p className="text-sm text-green-800 mt-1 mb-3">
        Speichere Judo Lernen auf deinem Startbildschirm und übe schneller weiter.
      </p>
      <button
        type="button"
        onClick={handleInstallClick}
        className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform"
        data-testid="install-btn"
      >
        App installieren
      </button>
    </section>
  );
}
