import { useState, useMemo } from 'react';
import type { Grade, QuizMode, QuizQuestion } from '../data/types';

interface QuizProps {
  grade: Grade;
  mode: QuizMode;
  onBack: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildChoices(correct: QuizQuestion, all: QuizQuestion[], mode: QuizMode): string[] {
  const correctAnswer = mode === 'term-to-meaning' ? correct.meaning : correct.term;
  const pool = all
    .filter((q) => q.id !== correct.id)
    .map((q) => (mode === 'term-to-meaning' ? q.meaning : q.term));
  const wrong = shuffle(pool).slice(0, 3);
  return shuffle([correctAnswer, ...wrong]);
}

type AnswerState = 'unanswered' | 'correct' | 'wrong';

export function Quiz({ grade, mode, onBack }: QuizProps) {
  const questions = useMemo(() => shuffle(grade.questions), [grade.questions]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = questions[index];
  const question = mode === 'term-to-meaning' ? current.term : current.meaning;
  const correctAnswer = mode === 'term-to-meaning' ? current.meaning : current.term;
  const choices = useMemo(
    () => buildChoices(current, grade.questions, mode),
    [current, grade.questions, mode]
  );

  function handleSelect(choice: string) {
    if (answerState !== 'unanswered') return;
    setSelected(choice);
    if (choice === correctAnswer) {
      setAnswerState('correct');
      setScore((s) => s + 1);
    } else {
      setAnswerState('wrong');
    }
  }

  function handleNext() {
    if (index + 1 >= questions.length) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setAnswerState('unanswered');
    }
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const emoji = pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪';
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-7xl mb-4">{emoji}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz beendet!</h2>
          <p className="text-gray-500 mb-1">
            {score} von {questions.length} richtig
          </p>
          <div className="text-4xl font-bold mt-2 mb-8" style={{ color: pct >= 80 ? '#16a34a' : pct >= 50 ? '#ca8a04' : '#dc2626' }}>
            {pct}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
            <div
              className="h-3 rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? '#16a34a' : pct >= 50 ? '#ca8a04' : '#dc2626' }}
            />
          </div>
          <button
            onClick={onBack}
            className="w-full bg-gray-800 text-white font-semibold py-4 rounded-2xl mb-3 active:scale-95 transition-transform"
          >
            Nochmal üben
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-gray-500 text-sm">
          ← Zurück
        </button>
        <span className="text-sm text-gray-500 font-medium">
          {index + 1} / {questions.length}
        </span>
        <span className="text-sm text-green-600 font-semibold">✓ {score}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div
          className="bg-green-500 h-2 rounded-full transition-all"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">
            {mode === 'term-to-meaning' ? 'Was bedeutet…?' : 'Wie heißt…?'}
          </p>
          <h2 className="text-2xl font-bold text-gray-800 leading-snug">{question}</h2>
          {current.category && (
            <span className="mt-3 inline-block text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
              {current.category}
            </span>
          )}
        </div>

        {/* Choices */}
        <div className="flex flex-col gap-3">
          {choices.map((choice) => {
            const isCorrect = choice === correctAnswer;
            const isSelected = choice === selected;

            let buttonClass =
              'w-full text-left py-4 px-5 rounded-2xl font-medium text-gray-800 border-2 transition-all active:scale-95 ';

            if (answerState === 'unanswered') {
              buttonClass += 'bg-white border-gray-200 shadow-sm';
            } else if (isCorrect) {
              buttonClass += 'bg-green-100 border-green-500 text-green-800';
            } else if (isSelected && !isCorrect) {
              buttonClass += 'bg-red-100 border-red-400 text-red-800';
            } else {
              buttonClass += 'bg-white border-gray-200 opacity-50';
            }

            return (
              <button key={choice} onClick={() => handleSelect(choice)} className={buttonClass}>
                <span className="mr-2">
                  {answerState !== 'unanswered' && isCorrect ? '✓ ' : ''}
                  {answerState !== 'unanswered' && isSelected && !isCorrect ? '✗ ' : ''}
                </span>
                {choice}
              </button>
            );
          })}
        </div>

        {/* Feedback + Next */}
        {answerState !== 'unanswered' && (
          <div className="mt-4">
            {current.comment && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 text-sm text-blue-800">
                💡 {current.comment}
              </div>
            )}
            {current.link && (
              <a
                href={current.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-xs text-blue-500 underline mb-3"
              >
                Technik auf judo.how ansehen →
              </a>
            )}
            <button
              onClick={handleNext}
              className="w-full bg-gray-800 text-white font-semibold py-4 rounded-2xl active:scale-95 transition-transform"
            >
              {index + 1 >= questions.length ? 'Ergebnis anzeigen' : 'Weiter →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
