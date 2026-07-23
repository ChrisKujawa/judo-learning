import { useState } from 'react';
import { GradeSelector } from './components/GradeSelector';
import { Quiz } from './components/Quiz';
import { grades } from './data/grades';
import type { Grade } from './data/types';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import {
  loadProgress,
  recordCompletedQuiz,
  resetProgress,
  saveProgress,
  selectLatestGrade,
  type CompletedQuiz,
  type ProgressStats,
} from './utils/progress';

type Screen = 'grades' | 'quiz';

export default function App() {
  const [screen, setScreen] = useState<Screen>('grades');
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [progress, setProgress] = useState<ProgressStats>(() => loadProgress());
  const installPrompt = useInstallPrompt();

  function handleGradeSelect(grade: Grade) {
    const nextProgress = selectLatestGrade(progress, grade.id);
    setProgress(nextProgress);
    saveProgress(nextProgress);
    setSelectedGrade(grade);
    setScreen('quiz');
  }

  function handleQuizComplete(quiz: CompletedQuiz) {
    const nextProgress = recordCompletedQuiz(progress, quiz);
    setProgress(nextProgress);
    saveProgress(nextProgress);
  }

  function handleResetProgress() {
    setProgress(resetProgress());
  }

  if (screen === 'quiz' && selectedGrade) {
    return (
      <Quiz
        grade={selectedGrade}
        progress={progress}
        onBack={() => setScreen('grades')}
        onComplete={handleQuizComplete}
      />
    );
  }

  return (
    <GradeSelector
      grades={grades}
      progress={progress}
      installPrompt={installPrompt}
      onSelect={handleGradeSelect}
      onResetProgress={handleResetProgress}
    />
  );
}
