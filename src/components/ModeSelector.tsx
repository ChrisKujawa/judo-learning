import type { Grade, QuizMode } from '../data/types';

interface ModeSelectorProps {
  grade: Grade;
  onSelectMode: (mode: QuizMode) => void;
  onBack: () => void;
}

export function ModeSelector({ grade, onSelectMode, onBack }: ModeSelectorProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <button onClick={onBack} className="text-gray-500 mb-6 flex items-center gap-1 text-sm">
          ← Zurück
        </button>

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🥋</div>
          <h2 className="text-2xl font-bold text-gray-800">{grade.name}</h2>
          <p className="text-gray-500 mt-1">{grade.questions.length} Begriffe</p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => onSelectMode('term-to-meaning')}
            className="bg-white border-2 border-gray-200 rounded-2xl p-5 text-left shadow-sm active:bg-gray-50 transition"
          >
            <div className="text-2xl mb-2">🇯🇵 → 🇩🇪</div>
            <div className="font-semibold text-gray-800">Japanisch → Deutsch</div>
            <div className="text-sm text-gray-500 mt-1">
              Japanischer Begriff angezeigt — wähle die richtige Bedeutung
            </div>
          </button>

          <button
            onClick={() => onSelectMode('meaning-to-term')}
            className="bg-white border-2 border-gray-200 rounded-2xl p-5 text-left shadow-sm active:bg-gray-50 transition"
          >
            <div className="text-2xl mb-2">🇩🇪 → 🇯🇵</div>
            <div className="font-semibold text-gray-800">Deutsch → Japanisch</div>
            <div className="text-sm text-gray-500 mt-1">
              Deutsche Bedeutung angezeigt — wähle den richtigen Begriff
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
