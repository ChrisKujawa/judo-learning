import { useState } from 'react';
import { GradeSelector } from './components/GradeSelector';
import { Quiz } from './components/Quiz';
import { grades } from './data/grades';
import type { Grade } from './data/types';

type Screen = 'grades' | 'quiz';

export default function App() {
  const [screen, setScreen] = useState<Screen>('grades');
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);

  function handleGradeSelect(grade: Grade) {
    setSelectedGrade(grade);
    setScreen('quiz');
  }

  if (screen === 'quiz' && selectedGrade) {
    return (
      <Quiz
        grade={selectedGrade}
        onBack={() => setScreen('grades')}
      />
    );
  }

  return <GradeSelector grades={grades} onSelect={handleGradeSelect} />;
}
