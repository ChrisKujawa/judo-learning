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

      <div className="flex flex-col gap-3 w-full max-w-sm">
        {grades.map((grade) => (
          <button
            key={grade.id}
            onClick={() => onSelect(grade)}
            className={`${grade.bgColor} ${grade.textColor} font-semibold text-base py-4 px-6 rounded-2xl shadow-md active:scale-95 transition-transform text-left`}
            data-testid={`grade-btn-${grade.id}`}
          >
            <div className="font-bold">{grade.name}</div>
            <div className="text-xs opacity-75 mt-0.5">{grade.subtitle}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
