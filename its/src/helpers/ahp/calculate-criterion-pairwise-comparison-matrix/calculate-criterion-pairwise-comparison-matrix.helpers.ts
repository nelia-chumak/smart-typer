import { AhpSkillLevel, PairwiseComparisonMatrix } from 'common/types/types.js';

const calculateCriterionPairwiseComparisonMatrix = (
  skills: AhpSkillLevel[],
): PairwiseComparisonMatrix => {
  const matrix: PairwiseComparisonMatrix = Array.from(
    { length: skills.length },
    () => Array.from({ length: skills.length }, () => 0),
  );

  for (let i = 0; i < skills.length; i++) {
    const firstSkillLevel = skills[i].level;
    for (let j = 0; j < skills.length; j++) {
      const secondSkillLevel = skills[j].level;
      if (secondSkillLevel === 0) {
        matrix[i][j] = 0;
      } else {
        matrix[i][j] = firstSkillLevel / secondSkillLevel;
      }
    }
  }

  return matrix;
};

export { calculateCriterionPairwiseComparisonMatrix };
