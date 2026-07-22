import type { InstallPromptControls } from '../hooks/useInstallPrompt';

export function InstallPrompt({ canInstall, onInstall }: InstallPromptControls) {
  if (!canInstall) return null;

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
        onClick={() => void onInstall()}
        className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform"
        data-testid="install-btn"
      >
        App installieren
      </button>
    </section>
  );
}
