import {
  AhpLesson,
  AhpSkillLevel,
  PairwiseComparisonMatrix,
} from 'common/types/types.js';
import { calculateAlternativePairwiseComparisonMatrix } from 'helpers/ahp/calculate-alternative-pairwise-comparison-matrix/calculate-alternative-pairwise-comparison-matrix.helper.js';

const calculateAlternativePairwiseComparisonMatrices = (
  lessons: AhpLesson[],
  skillLevels: AhpSkillLevel[],
): PairwiseComparisonMatrix[] => {
  const matrices = [] as PairwiseComparisonMatrix[];

  for (const skillLevel of skillLevels) {
    const mappedLessons = lessons.map(
      ({ lessonId, contentType, skillsCountInLesson }) => ({
        lessonId,
        contentType,
        count:
          skillsCountInLesson.find(
            (skillCount) => skillCount.skillId === skillLevel.skillId,
          )?.count ?? 0,
        level: skillLevel.level,
      }),
    );

    const matrix = calculateAlternativePairwiseComparisonMatrix(mappedLessons);
    matrices.push(matrix);
  }

  return matrices;
};

export { calculateAlternativePairwiseComparisonMatrices };
