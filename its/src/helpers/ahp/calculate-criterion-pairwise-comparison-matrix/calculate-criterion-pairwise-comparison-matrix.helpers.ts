import { AhpSkillLevel, PairwiseComparisonMatrix } from 'common/types/types.js';

const EPS = 1e-6;
const MIN = 1 / 9;
const MAX = 9;

const calculateCriterionPairwiseComparisonMatrix = (
  skills: AhpSkillLevel[],
): PairwiseComparisonMatrix => {
  const n = skills.length;

  const matrix: PairwiseComparisonMatrix = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => 1),
  );

  for (let i = 0; i < n; i++) {
    const a = Math.max(skills[i].level, EPS);

    for (let j = i + 1; j < n; j++) {
      const b = Math.max(skills[j].level, EPS);

      let ratio = a / b;
      ratio = Math.min(MAX, Math.max(MIN, ratio));

      matrix[i][j] = ratio;
      matrix[j][i] = 1 / ratio;
    }
  }

  return matrix;
};

export { calculateCriterionPairwiseComparisonMatrix };
