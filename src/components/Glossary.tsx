import { useMemo, useState } from 'react';
import type { Technique } from '../data/types';

interface GlossaryProps {
  techniques: Technique[];
  onBack: () => void;
}

export function Glossary({ techniques, onBack }: GlossaryProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [introducedAt, setIntroducedAt] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);

  const categories = useMemo(
    () =>
      [...new Set(techniques.map((technique) => technique.category))].sort((left, right) =>
        left.localeCompare(right, 'de')
      ),
    [techniques]
  );

  const filteredTechniques = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('de');

    return techniques
      .filter(
        (technique) =>
          !normalizedQuery ||
          [technique.term, technique.meaning, technique.translation]
            .filter(Boolean)
            .some((value) => value?.toLocaleLowerCase('de').includes(normalizedQuery))
      )
      .filter((technique) => !category || technique.category === category)
      .filter(
        (technique) => !introducedAt || technique.introducedAt === Number(introducedAt)
      )
      .sort((left, right) => left.term.localeCompare(right.term, 'de'));
  }, [category, introducedAt, query, techniques]);

  if (selectedTechnique) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 py-8">
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            onClick={() => setSelectedTechnique(null)}
            className="mb-6 font-semibold text-blue-700"
            data-testid="glossary-detail-back"
          >
            ← Zurück zum Lexikon
          </button>

          <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {selectedTechnique.imageUrl && (
              <img
                src={selectedTechnique.imageUrl}
                alt={`${selectedTechnique.term} Illustration`}
                className="h-64 w-full bg-gray-100 object-contain"
              />
            )}
            <div className="p-5">
              <div className="mb-3 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-800">
                  {selectedTechnique.category}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                  Ab {selectedTechnique.introducedAt}. Kyu
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedTechnique.term}</h1>
              <p className="mt-2 text-lg text-gray-700">{selectedTechnique.meaning}</p>

              {selectedTechnique.translation && (
                <section className="mt-6">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                    Wörtliche Übersetzung
                  </h2>
                  <p className="mt-1 text-gray-700">{selectedTechnique.translation}</p>
                </section>
              )}

              {selectedTechnique.comment && (
                <section className="mt-6 rounded-xl bg-amber-50 p-4">
                  <h2 className="font-bold text-amber-900">Merke</h2>
                  <p className="mt-1 text-amber-900">{selectedTechnique.comment}</p>
                </section>
              )}

              {selectedTechnique.link && (
                <a
                  href={selectedTechnique.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white"
                >
                  Mehr erfahren ↗
                </a>
              )}
            </div>
          </article>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 py-8">
      <div className="mx-auto max-w-2xl">
        <button type="button" onClick={onBack} className="mb-6 font-semibold text-blue-700">
          ← Zurück
        </button>

        <header className="mb-6">
          <div className="mb-2 text-4xl">📖</div>
          <h1 className="text-3xl font-bold text-gray-900">Judo-Lexikon</h1>
          <p className="mt-2 text-gray-600">
            Begriffe und Techniken nachschlagen und besser verstehen.
          </p>
        </header>

        <section
          aria-label="Lexikon filtern"
          className="mb-6 grid gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-2"
        >
          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-gray-700">Suchen</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Japanischer Begriff oder Bedeutung"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
            />
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold text-gray-700">Kategorie</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-gray-900"
            >
              <option value="">Alle Kategorien</option>
              {categories.map((availableCategory) => (
                <option key={availableCategory} value={availableCategory}>
                  {availableCategory}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold text-gray-700">Eingeführt im</span>
            <select
              value={introducedAt}
              onChange={(event) => setIntroducedAt(event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-gray-900"
            >
              <option value="">Alle Kyu-Grade</option>
              {[8, 7, 6, 5, 4, 3, 2, 1].map((kyu) => (
                <option key={kyu} value={kyu}>
                  {kyu}. Kyu
                </option>
              ))}
            </select>
          </label>
        </section>

        <p className="mb-3 text-sm text-gray-600" aria-live="polite">
          {filteredTechniques.length} {filteredTechniques.length === 1 ? 'Eintrag' : 'Einträge'}
        </p>

        {filteredTechniques.length === 0 ? (
          <div
            className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-gray-600"
            data-testid="glossary-empty"
          >
            Keine passenden Einträge gefunden.
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredTechniques.map((technique) => (
              <button
                key={technique.id}
                type="button"
                onClick={() => setSelectedTechnique(technique)}
                className="rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-transform active:scale-[0.99]"
                data-testid={`glossary-entry-${technique.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{technique.term}</h2>
                    <p className="mt-1 text-sm text-gray-600">{technique.meaning}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    {technique.introducedAt}. Kyu
                  </span>
                </div>
                <p className="mt-3 text-xs font-semibold text-blue-700">{technique.category}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
