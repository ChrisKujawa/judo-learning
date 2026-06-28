import type { Grade } from './types';
import { ALL_TECHNIQUES } from './techniques';

function techniquesForGrade(kyu: number) {
  return ALL_TECHNIQUES.filter((t) => t.introducedAt >= kyu);
}

export const grades: Grade[] = [
  {
    id: 'kyu8',
    kyu: 8,
    name: '8. Kyu – Weiß-Gelb',
    subtitle: 'Dein erster Schritt',
    bgColor: 'bg-yellow-200',
    textColor: 'text-yellow-900',
    techniques: techniquesForGrade(8),
  },
  {
    id: 'kyu7',
    kyu: 7,
    name: '7. Kyu – Gelb',
    subtitle: 'Fallen, Werfen, Halten',
    bgColor: 'bg-yellow-400',
    textColor: 'text-yellow-900',
    techniques: techniquesForGrade(7),
  },
  {
    id: 'kyu6',
    kyu: 6,
    name: '6. Kyu – Gelb-Orange',
    subtitle: 'Vertiefung und Variation',
    bgColor: 'bg-orange-300',
    textColor: 'text-orange-900',
    techniques: techniquesForGrade(6),
  },
  {
    id: 'kyu5',
    kyu: 5,
    name: '5. Kyu – Orange',
    subtitle: 'Anwenden und Befreien',
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
    techniques: techniquesForGrade(5),
  },
  {
    id: 'kyu4',
    kyu: 4,
    name: '4. Kyu – Orange-Grün',
    subtitle: 'Werfen auf einem Bein',
    bgColor: 'bg-lime-500',
    textColor: 'text-white',
    techniques: techniquesForGrade(4),
  },
  {
    id: 'kyu3',
    kyu: 3,
    name: '3. Kyu – Grün',
    subtitle: 'Sensationelle Technikwelten',
    bgColor: 'bg-green-600',
    textColor: 'text-white',
    techniques: techniquesForGrade(3),
  },
  {
    id: 'kyu2',
    kyu: 2,
    name: '2. Kyu – Blau',
    subtitle: 'Die Judo-Taktik',
    bgColor: 'bg-blue-600',
    textColor: 'text-white',
    techniques: techniquesForGrade(2),
  },
  {
    id: 'kyu1',
    kyu: 1,
    name: '1. Kyu – Braun',
    subtitle: 'Das eigene Judoprofil',
    bgColor: 'bg-amber-800',
    textColor: 'text-white',
    techniques: techniquesForGrade(1),
  },
];
