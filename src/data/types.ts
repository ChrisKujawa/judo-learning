/** How a specific question is presented in the quiz */
export type QuestionType = 'image-to-name' | 'term-to-meaning' | 'judo-wert';

export interface Technique {
  id: string;
  term: string;
  /** Short German meaning shown as the correct answer */
  meaning: string;
  /** Word-by-word translation breakdown */
  translation?: string;
  category: string;
  /** Pedagogical note / how-to hint shown after answering */
  comment?: string;
  link?: string;
  /** Wikimedia Commons image URL for throw illustrations */
  imageUrl?: string;
  /** First introduced at this Kyu level (8=lowest, 1=highest) */
  introducedAt: number;
}

export interface Grade {
  id: string;
  kyu: number;
  name: string;
  subtitle: string;
  /** Tailwind bg color class for the button */
  bgColor: string;
  textColor: string;
  techniques: Technique[];
}

