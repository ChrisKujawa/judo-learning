import { useState } from 'react';
import { trackAnalyticsEvent } from './analytics';
import { GradeSelector } from './components/GradeSelector';
import { Glossary } from './components/Glossary';
import { Quiz } from './components/Quiz';
import { grades } from './data/grades';
import { ALL_TECHNIQUES } from './data/techniques';
import type { Grade } from './data/types';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import {
  loadProgress,
  recordCompletedQuiz,
  recordQuizAnswer,
  resetProgress,
  saveProgress,
  selectLatestGrade,
  type CompletedQuiz,
  type CompletedQuizAnswer,
  type ProgressStats,
} from './utils/progress';

type Screen = 'grades' | 'glossary' | 'quiz';

export default function App() {
  const [screen, setScreen] = useState<Screen>('grades');
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [progress, setProgress] = useState<ProgressStats>(() => loadProgress());
  const installPrompt = useInstallPrompt();

  function handleGradeSelect(grade: Grade) {
    trackAnalyticsEvent({
      path: `kyu-selected-${grade.id}`,
      title: `Kyu selected: ${grade.name}`,
    });
    trackAnalyticsEvent({
      path: `quiz-started-${grade.id}`,
      title: `Quiz started: ${grade.name}`,
    });

    const nextProgress = selectLatestGrade(progress, grade.id);
    setProgress(nextProgress);
    saveProgress(nextProgress);
    setSelectedGrade(grade);
    setScreen('quiz');
  }

  function handleQuizComplete(quiz: CompletedQuiz) {
    setProgress((currentProgress) => {
      const nextProgress = recordCompletedQuiz(currentProgress, quiz);
      saveProgress(nextProgress);
      return nextProgress;
    });
    trackAnalyticsEvent({
      path: `quiz-finished-${quiz.gradeId}`,
      title: `Quiz finished: ${quiz.gradeName} (${Math.round((quiz.score / quiz.totalQuestions) * 100)}%)`,
    });
  }

  function handleQuizAnswer(gradeId: string, answer: CompletedQuizAnswer) {
    setProgress((currentProgress) => {
      const nextProgress = recordQuizAnswer(currentProgress, {
        ...answer,
        gradeId,
      });
      saveProgress(nextProgress);
      return nextProgress;
    });
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
        onAnswer={(answer) => handleQuizAnswer(selectedGrade.id, answer)}
        onComplete={handleQuizComplete}
      />
    );
  }

  if (screen === 'glossary') {
    return <Glossary techniques={ALL_TECHNIQUES} onBack={() => setScreen('grades')} />;
  }

  return (
    <GradeSelector
      grades={grades}
      progress={progress}
      installPrompt={installPrompt}
      onSelect={handleGradeSelect}
      onOpenGlossary={() => setScreen('glossary')}
      onResetProgress={handleResetProgress}
    />
  );
}
