export type QuizMode = 'term-to-meaning' | 'meaning-to-term';

export interface QuizQuestion {
  id: string;
  term: string;
  meaning: string;
  category: string;
  comment?: string;
  link?: string;
}

export interface Grade {
  id: string;
  name: string;
  color: string;
  beltColor: string;
  questions: QuizQuestion[];
}
