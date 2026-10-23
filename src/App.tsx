import { useState } from 'react';
import { trackAnalyticsEvent } from './analytics';
import { GradeSelector } from './components/GradeSelector';
import { Glossary } from './components/Glossary';
import { InfoScreen } from './components/InfoScreen';
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

type Screen = 'grades' | 'glossary' | 'info' | 'quiz';

export default function App() {
  const [screen, setScreen] = useState<Screen>('grades');
  const [infoReturnScreen, setInfoReturnScreen] =
    useState<Exclude<Screen, 'info'>>('grades');
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

  function handleOpenInfo() {
    if (screen !== 'info') {
      setInfoReturnScreen(screen);
    }
    trackAnalyticsEvent({
      path: 'info-opened',
      title: 'App information opened',
    });
    setScreen('info');
  }

  function handleFeedback() {
    trackAnalyticsEvent({
      path: 'feedback-opened',
      title: 'Feedback opened',
    });
  }

  function handleRepository() {
    trackAnalyticsEvent({
      path: 'repository-opened',
      title: 'Repository opened',
    });
  }

  let content;

  if (screen === 'quiz' && selectedGrade) {
    content = (
      <Quiz
        grade={selectedGrade}
        progress={progress}
        onBack={() => setScreen('grades')}
        onAnswer={(answer) => handleQuizAnswer(selectedGrade.id, answer)}
        onComplete={handleQuizComplete}
      />
    );
  } else if (screen === 'glossary') {
    content = <Glossary techniques={ALL_TECHNIQUES} onBack={() => setScreen('grades')} />;
  } else if (screen === 'info') {
    content = (
      <InfoScreen
        onBack={() => setScreen(infoReturnScreen)}
        onFeedback={handleFeedback}
        onRepository={handleRepository}
      />
    );
  } else {
    content = (
      <GradeSelector
        grades={grades}
        progress={progress}
        installPrompt={installPrompt}
        onSelect={handleGradeSelect}
        onOpenGlossary={() => setScreen('glossary')}
        onOpenInfo={handleOpenInfo}
        onResetProgress={handleResetProgress}
      />
    );
  }

  return (
    <>
      {content}
      {(screen === 'quiz' || screen === 'glossary') && (
        <button
          type="button"
          onClick={handleOpenInfo}
          className="fixed bottom-4 right-4 z-50 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-lg"
          data-testid="open-info-floating-btn"
        >
          ⓘ Über &amp; Rechtliches
        </button>
      )}
    </>
  );
}
