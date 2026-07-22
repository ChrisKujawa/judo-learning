import { useState, useMemo } from 'react';
import type { Grade, Technique, QuestionType } from '../data/types';
import { shuffle, assignQuestionType, buildChoices, buildWertChoices, scoreEmoji, scoreColor } from '../utils/quiz';
import { calculateAccuracy, type CompletedQuiz, type CompletedQuizAnswer, type ProgressStats } from '../utils/progress';

interface QuizProps {
  grade: Grade;
  progress?: ProgressStats;
  onBack: () => void;
  onComplete?: (quiz: CompletedQuiz) => void;
}

interface Question {
  technique: Technique;
  type: QuestionType;
}

type AnswerState = 'unanswered' | 'correct' | 'wrong';

export function Quiz({ grade, progress, onBack, onComplete }: QuizProps) {
  const [allowImageQuestions] = useState(() => navigator.onLine);
  const questions: Question[] = useMemo(
    () => shuffle(grade.techniques).map((t) => ({
      technique: t,
      type: assignQuestionType(t, { allowImageQuestions }),
    })),
    [allowImageQuestions, grade.techniques]
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<CompletedQuizAnswer[]>([]);
  const [finished, setFinished] = useState(false);

  const { technique: current, type: questionType } = questions[index];

  const question =
    questionType === 'judo-wert' ? 'Welcher Begriff ist ein Judo-Wert?' :
    questionType === 'image-to-name' ? 'Welche Technik ist das?' :
    current.term;

  const correctAnswer =
    questionType === 'term-to-meaning' ? current.meaning : current.term;

  const choices = useMemo(() => {
    if (questionType === 'judo-wert') return buildWertChoices(current);
    return buildChoices(current, grade.techniques, questionType);
  }, [current, grade.techniques, questionType]);

  // After answering: for image-to-name show the German meaning; otherwise show the comment
  const hint =
    questionType === 'judo-wert' ? current.meaning :
    questionType === 'image-to-name' ? current.meaning :
    current.comment;

  // Show image before answering only for image-to-name; after answering for term-to-meaning
  const showImageBefore = questionType === 'image-to-name' && !!current.imageUrl;
  const showImageAfter  = questionType === 'term-to-meaning' && !!current.imageUrl && answerState !== 'unanswered';

  const label =
    questionType === 'judo-wert' ? 'Judo-Wert erkennen' :
    questionType === 'image-to-name' ? 'Welche Technik ist das?' :
    'Was bedeutet…?';

  function handleSelect(choice: string) {
    if (answerState !== 'unanswered') return;

    const isCorrect = choice === correctAnswer;
    setSelected(choice);
    setAnswers((currentAnswers) => [
      ...currentAnswers,
      { techniqueId: current.id, correct: isCorrect },
    ]);

    if (isCorrect) {
      setAnswerState('correct');
      setScore((s) => s + 1);
    } else {
      setAnswerState('wrong');
    }
  }

  function handleNext() {
    if (index + 1 >= questions.length) {
      onComplete?.({
        gradeId: grade.id,
        gradeName: grade.name,
        completedAt: new Date().toISOString(),
        score,
        totalQuestions: questions.length,
        answers,
      });
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setAnswerState('unanswered');
    }
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const totalAccuracy = progress
      ? calculateAccuracy(progress.totalCorrectAnswers, progress.totalAnswers)
      : 0;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm text-center" data-testid="score-screen">
          <div className="text-7xl mb-4" data-testid="score-emoji">{scoreEmoji(pct)}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz beendet!</h2>
          <p className="text-gray-500 mb-1" data-testid="score-text">
            {score} von {questions.length} richtig
          </p>
          <div
            className="text-4xl font-bold mt-2 mb-8"
            style={{ color: scoreColor(pct) }}
            data-testid="score-pct"
          >
            {pct}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
            <div
              className="h-3 rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: scoreColor(pct) }}
              data-testid="score-bar"
            />
          </div>
          {progress && progress.totalQuizzesCompleted > 0 && (
            <div
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 text-left"
              data-testid="score-stats-summary"
            >
              <h3 className="font-bold text-gray-800 mb-2">Dein Lernstand</h3>
              <p className="text-sm text-gray-600">
                Insgesamt {progress.totalQuizzesCompleted} Quiz abgeschlossen, {totalAccuracy}% richtig.
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Bestwert: {progress.bestScorePercentage}%
              </p>
            </div>
          )}
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
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-gray-500 text-sm">
          ← Zurück
        </button>
        <span className="text-sm text-gray-500 font-medium" data-testid="progress">
          {index + 1} / {questions.length}
        </span>
        <span className="text-sm text-green-600 font-semibold" data-testid="score">✓ {score}</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div
          className="bg-green-500 h-2 rounded-full transition-all"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3" data-testid="question-label">
            {label}
          </p>
          {showImageBefore && (
            <img
              src={current.imageUrl}
              alt={`${current.term} Illustration`}
              className="mx-auto mb-4 max-h-44 object-contain rounded-xl"
              data-testid="technique-image-before"
            />
          )}
          <h2 className="text-2xl font-bold text-gray-800 leading-snug" data-testid="question">
            {question}
          </h2>
          {current.category && (
            <span className="mt-3 inline-block text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
              {current.category}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3" data-testid="choices">
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
              <button
                key={choice}
                onClick={() => handleSelect(choice)}
                className={buttonClass}
                data-testid={`choice-${isCorrect ? 'correct' : 'wrong'}`}
              >
                <span className="mr-2">
                  {answerState !== 'unanswered' && isCorrect ? '✓ ' : ''}
                  {answerState !== 'unanswered' && isSelected && !isCorrect ? '✗ ' : ''}
                </span>
                {choice}
              </button>
            );
          })}
        </div>

        {answerState !== 'unanswered' && (
          <div className="mt-4">
            {showImageAfter && (
              <img
                src={current.imageUrl}
                alt={`${current.term} Illustration`}
                className="mx-auto mb-3 max-h-44 object-contain rounded-xl"
                data-testid="technique-image-after"
              />
            )}
            {hint && (
              <div
                className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 text-sm text-blue-800"
                data-testid="hint"
              >
                💡 {hint}
              </div>
            )}
            {current.link && (
              <a
                href={current.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-xs text-blue-500 underline mb-3"
                data-testid="judo-how-link"
              >
                Technik auf judo.how ansehen →
              </a>
            )}
            <button
              onClick={handleNext}
              className="w-full bg-gray-800 text-white font-semibold py-4 rounded-2xl active:scale-95 transition-transform"
              data-testid="next-btn"
            >
              {index + 1 >= questions.length ? 'Ergebnis anzeigen' : 'Weiter →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
