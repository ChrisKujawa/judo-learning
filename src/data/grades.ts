import type { Grade } from './types';
import { greenBeltQuestions } from './green';

export const grades: Grade[] = [
  {
    id: 'green',
    name: 'Grüner Gürtel',
    color: 'bg-green-600',
    beltColor: 'text-green-700',
    questions: greenBeltQuestions,
  },
  // Future grades can be added here:
  // { id: 'blue', name: 'Blauer Gürtel', ... }
];
