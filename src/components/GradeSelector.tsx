import type { Grade } from '../data/types';
import { calculateAccuracy, type ProgressStats } from '../utils/progress';
import type { InstallPromptControls } from '../hooks/useInstallPrompt';
import { InstallPrompt } from './InstallPrompt';

interface GradeSelectorProps {
  grades: Grade[];
  progress?: ProgressStats;
  installPrompt?: InstallPromptControls;
  onSelect: (grade: Grade) => void;
  onResetProgress?: () => void;
}

export function GradeSelector({
  grades,
  progress,
  installPrompt,
  onSelect,
  onResetProgress,
}: GradeSelectorProps) {
  const hasProgress = progress
    ? progress.totalQuizzesCompleted > 0 || progress.latestSelectedGradeId !== null
    : false;
  const canResetProgress = hasProgress && !!onResetProgress;
  const latestGrade = grades.find((grade) => grade.id === progress?.latestSelectedGradeId);
  const totalAccuracy = progress
    ? calculateAccuracy(progress.totalCorrectAnswers, progress.totalAnswers)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 py-8">
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">🥋</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Judo Lernen</h1>
        <p className="text-gray-500">Wähle deinen Gürtelgrad zum Üben</p>
      </div>

      {installPrompt && <InstallPrompt {...installPrompt} />}

      {progress && (
        <section
          className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6"
          data-testid="stats-summary"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="text-base font-bold text-gray-800">Dein Lernstand</h2>
              <p className="text-xs text-gray-500">Nur auf diesem Gerät gespeichert</p>
            </div>
            <button
              type="button"
              onClick={onResetProgress}
              disabled={!canResetProgress}
              className="text-xs font-semibold text-red-600 disabled:text-gray-300 disabled:cursor-not-allowed"
              data-testid="reset-progress-btn"
            >
              Zurücksetzen
            </button>
          </div>

          {progress.totalQuizzesCompleted === 0 ? (
            <p className="text-sm text-gray-600" data-testid="stats-empty">
              Noch kein Quiz abgeschlossen.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-gray-50 p-2">
                <div className="text-lg font-bold text-gray-800" data-testid="stats-total-quizzes">
                  {progress.totalQuizzesCompleted}
                </div>
                <div className="text-[11px] text-gray-500">Quiz</div>
              </div>
              <div className="rounded-xl bg-gray-50 p-2">
                <div className="text-lg font-bold text-gray-800" data-testid="stats-total-accuracy">
                  {totalAccuracy}%
                </div>
                <div className="text-[11px] text-gray-500">Richtig</div>
              </div>
              <div className="rounded-xl bg-gray-50 p-2">
                <div className="text-lg font-bold text-gray-800" data-testid="stats-best-score">
                  {progress.bestScorePercentage}%
                </div>
                <div className="text-[11px] text-gray-500">Bestwert</div>
              </div>
            </div>
          )}

          {latestGrade && (
            <p className="text-xs text-gray-500 mt-3" data-testid="latest-selected-grade">
              Zuletzt gewählt: {latestGrade.name}
            </p>
          )}
          {progress.latestCompletedQuiz && (
            <p className="text-xs text-gray-500 mt-1" data-testid="latest-completed-quiz">
              Letztes Quiz: {progress.latestCompletedQuiz.gradeName},{' '}
              {progress.latestCompletedQuiz.score} von {progress.latestCompletedQuiz.totalQuestions} richtig (
              {progress.latestCompletedQuiz.percentage}%)
            </p>
          )}
        </section>
      )}

      <div className="flex flex-col gap-3 w-full max-w-sm">
        {grades.map((grade) => {
          const gradeProgress = progress?.grades[grade.id];
          const gradeAccuracy = gradeProgress
            ? calculateAccuracy(gradeProgress.totalCorrectAnswers, gradeProgress.totalAnswers)
            : 0;

          return (
            <button
              key={grade.id}
              onClick={() => onSelect(grade)}
              className={`${grade.bgColor} ${grade.textColor} font-semibold text-base py-4 px-6 rounded-2xl shadow-md active:scale-95 transition-transform text-left`}
              data-testid={`grade-btn-${grade.id}`}
            >
              <div className="font-bold">{grade.name}</div>
              <div className="text-xs opacity-75 mt-0.5">{grade.subtitle}</div>
              {gradeProgress && gradeProgress.quizzesCompleted > 0 && (
                <div className="text-xs opacity-85 mt-2" data-testid={`grade-stats-${grade.id}`}>
                  {gradeProgress.quizzesCompleted} Quiz, {gradeAccuracy}% richtig
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
