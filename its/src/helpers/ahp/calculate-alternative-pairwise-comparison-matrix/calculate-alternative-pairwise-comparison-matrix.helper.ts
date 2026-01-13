import {
  AhpLesson,
  AhpSkillCountInLesson,
  AhpSkillLevel,
  PairwiseComparisonMatrix,
} from 'common/types/types.js';
import { calculatePriorityCoefficient } from 'helpers/helpers.js';

type Lessons = {
  lessonId: AhpLesson['lessonId'];
  contentType: AhpLesson['contentType'];
  count: AhpSkillCountInLesson['count'];
  level: AhpSkillLevel['level'];
}[];

const MIN = 1 / 9;
const MAX = 9;

const calculateAlternativePairwiseComparisonMatrix = (
  lessons: Lessons,
): PairwiseComparisonMatrix => {
  const n = lessons.length;

  const matrix: PairwiseComparisonMatrix = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => 1),
  );

  for (let i = 0; i < n; i++) {
    const a = lessons[i];
    const aCoeff = calculatePriorityCoefficient(a.level, a.contentType);
    const aValue = a.count * aCoeff;

    for (let j = i + 1; j < n; j++) {
      const b = lessons[j];
      const bCoeff = calculatePriorityCoefficient(b.level, b.contentType);
      const bValue = b.count * bCoeff;

      let ratio: number;

      if (aValue === 0 && bValue === 0) {
        ratio = 1;
      } else if (bValue === 0) {
        ratio = MAX;
      } else if (aValue === 0) {
        ratio = MIN;
      } else {
        ratio = aValue / bValue;
      }

      ratio = Math.min(MAX, Math.max(MIN, ratio));

      matrix[i][j] = ratio;
      matrix[j][i] = 1 / ratio;
    }
  }

  return matrix;
};

export { calculateAlternativePairwiseComparisonMatrix };
