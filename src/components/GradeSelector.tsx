import type { Grade } from '../data/types';

interface GradeSelectorProps {
  grades: Grade[];
  onSelect: (grade: Grade) => void;
}

export function GradeSelector({ grades, onSelect }: GradeSelectorProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">🥋</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Judo Lernen</h1>
        <p className="text-gray-500">Wähle deinen Gürtelgrad zum Üben</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        {grades.map((grade) => (
          <button
            key={grade.id}
            onClick={() => onSelect(grade)}
            className={`${grade.color} text-white font-semibold text-lg py-5 px-6 rounded-2xl shadow-md active:scale-95 transition-transform`}
          >
            {grade.name}
          </button>
        ))}

        <div className="mt-4 py-5 px-6 rounded-2xl bg-gray-200 text-gray-400 font-semibold text-lg text-center cursor-not-allowed">
          Blauer Gürtel <span className="text-sm font-normal">(bald)</span>
        </div>
        <div className="py-5 px-6 rounded-2xl bg-gray-200 text-gray-400 font-semibold text-lg text-center cursor-not-allowed">
          Brauner Gürtel <span className="text-sm font-normal">(bald)</span>
        </div>
      </div>
    </div>
  );
}
