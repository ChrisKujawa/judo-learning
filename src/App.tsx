import { useState } from 'react';
import { GradeSelector } from './components/GradeSelector';
import { ModeSelector } from './components/ModeSelector';
import { Quiz } from './components/Quiz';
import { grades } from './data/grades';
import type { Grade, QuizMode } from './data/types';

type Screen = 'grades' | 'mode' | 'quiz';

export default function App() {
  const [screen, setScreen] = useState<Screen>('grades');
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedMode, setSelectedMode] = useState<QuizMode | null>(null);

  function handleGradeSelect(grade: Grade) {
    setSelectedGrade(grade);
    setScreen('mode');
  }

  function handleModeSelect(mode: QuizMode) {
    setSelectedMode(mode);
    setScreen('quiz');
  }

  if (screen === 'quiz' && selectedGrade && selectedMode) {
    return (
      <Quiz
        grade={selectedGrade}
        mode={selectedMode}
        onBack={() => setScreen('mode')}
      />
    );
  }

  if (screen === 'mode' && selectedGrade) {
    return (
      <ModeSelector
        grade={selectedGrade}
        onSelectMode={handleModeSelect}
        onBack={() => setScreen('grades')}
      />
    );
  }

  return <GradeSelector grades={grades} onSelect={handleGradeSelect} />;
}
