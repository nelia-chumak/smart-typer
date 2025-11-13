import { PairwiseComparisonMatrix } from 'common/types/types.js';

const checkConsistencyIndex = (
  matrix: PairwiseComparisonMatrix,
  lambdaMax: number,
): boolean => {
  const k = matrix.length;
  let CI = Math.abs(lambdaMax - k) / (k - 1);
  CI = Math.round(CI * 10) / 10;
  return CI <= 0.1;
};

export { checkConsistencyIndex };
