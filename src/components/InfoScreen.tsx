import { useLayoutEffect, useRef } from 'react';

export const REPOSITORY_URL = 'https://github.com/ChrisKujawa/judo-learning';
export const CONTACT_EMAIL = 'zelldon91 [at] gmail.com';
export const FEEDBACK_URL =
  'https://github.com/ChrisKujawa/judo-learning/issues/new?title=Feedback%3A%20&body=%23%23%20Mein%20Feedback%0A%0A%0A%0A%23%23%20Bereich%0A%0A-%20%5B%20%5D%20Inhalt%20oder%20Technik%0A-%20%5B%20%5D%20Bedienung%0A-%20%5B%20%5D%20Verbesserungsvorschlag%0A-%20%5B%20%5D%20Sonstiges';

interface InfoScreenProps {
  onBack: () => void;
  onFeedback?: () => void;
  onRepository?: () => void;
}

export function InfoScreen({ onBack, onFeedback, onRepository }: InfoScreenProps) {
  const backButtonRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    backButtonRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-4 py-8" data-testid="info-screen">
      <div className="mx-auto max-w-2xl">
        <button
          ref={backButtonRef}
          type="button"
          onClick={onBack}
          className="mb-6 font-semibold text-blue-700"
        >
          ← Zurück
        </button>

        <header className="mb-6">
          <div className="mb-2 text-4xl" aria-hidden="true">
            🥋
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Über Judo Lernen</h1>
          <p className="mt-2 text-gray-600">
            Eine kostenlose, offene Lernhilfe für die Kyu-Graduierung im Judo.
          </p>
        </header>

        <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Feedback &amp; Mitmachen</h2>
          <p className="mt-2 text-gray-600">
            Ist ein Inhalt falsch, fehlt etwas oder hast du eine Idee? Melde es direkt im
            öffentlichen GitHub-Projekt.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <a
              href={FEEDBACK_URL}
              target="_blank"
              rel="noreferrer"
              onClick={onFeedback}
              className="rounded-xl bg-green-700 px-4 py-3 text-center font-semibold text-white"
              data-testid="feedback-link"
            >
              Feedback geben ↗
            </a>
            <a
              href={REPOSITORY_URL}
              target="_blank"
              rel="noreferrer"
              onClick={onRepository}
              className="rounded-xl border border-gray-300 px-4 py-3 text-center font-semibold text-gray-800"
              data-testid="repository-link"
            >
              Quellcode auf GitHub ↗
            </a>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Für das Erstellen eines Feedback-Beitrags ist ein GitHub-Konto erforderlich.
          </p>
        </section>

        <section
          className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          data-testid="privacy-notice"
        >
          <h2 className="text-xl font-bold text-gray-900">Datenschutz</h2>

          <h3 className="mt-4 font-bold text-gray-800">Verantwortliche Stelle</h3>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Christopher Kujawa
            <br />
            c/o Sport-Dojo Berlin e.V.
            <br />
            Boizenburger Str. 6
            <br />
            12619 Berlin
            <br />
            E-Mail: {CONTACT_EMAIL}
          </p>

          <h3 className="mt-4 font-bold text-gray-800">Lernfortschritt</h3>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Deine detaillierten Lernstände, Antworten und Ergebnisse werden ausschließlich im
            lokalen Speicher deines Browsers gespeichert. Du kannst sie auf der Startseite
            jederzeit löschen.
          </p>

          <h3 className="mt-4 font-bold text-gray-800">Hosting über GitHub Pages</h3>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Diese Website wird über GitHub Pages bereitgestellt. Beim Aufruf verarbeitet GitHub
            technisch notwendige Verbindungsdaten, beispielsweise die IP-Adresse. Weitere
            Informationen findest du in der{' '}
            <a
              href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-blue-700 underline"
            >
              Datenschutzerklärung von GitHub
            </a>
            .
          </p>

          <h3 className="mt-4 font-bold text-gray-800">Reichweitenmessung mit GoatCounter</h3>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            GoatCounter zählt Seitenaufrufe und ausgewählte Nutzungsvorgänge in zusammengefasster
            Form. Dazu gehören der ausgewählte Kyu-Grad sowie Start und Abschluss eines Quiz.
            Einzelne Antworten und das Ergebnis werden nicht übertragen. Der Dienst setzt keine
            Cookies und speichert weder IP-Adressen noch dauerhafte Nutzerkennungen. Die
            Verarbeitung erfolgt auf Servern in Deutschland und Finnland. Details beschreibt die{' '}
            <a
              href="https://www.goatcounter.com/help/privacy"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-blue-700 underline"
            >
              Datenschutzerklärung von GoatCounter
            </a>
            .
          </p>

          <h3 className="mt-4 font-bold text-gray-800">Feedback über GitHub</h3>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Wenn du den Feedback-Link öffnest, wechselst du zu GitHub. GitHub verarbeitet dabei
            Verbindungs- und gegebenenfalls Kontodaten nach den eigenen Datenschutzbestimmungen.
            Veröffentliche in einem Feedback-Beitrag keine persönlichen oder vertraulichen
            Informationen.
          </p>
        </section>

        <section
          className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          data-testid="imprint"
        >
          <h2 className="text-xl font-bold text-gray-900">Impressum</h2>
          <div className="mt-4 space-y-1 text-sm leading-6 text-gray-700">
            <p>Angaben gemäß § 18 Abs. 1 MStV</p>
            <p>Christopher Kujawa</p>
            <p>c/o Sport-Dojo Berlin e.V.</p>
            <p>Boizenburger Str. 6</p>
            <p>12619 Berlin</p>
            <p>E-Mail: {CONTACT_EMAIL}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
