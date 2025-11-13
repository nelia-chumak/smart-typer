import { PairwiseComparisonMatrix } from 'common/types/types.js';
import { calculateLambdaMax, checkConsistencyIndex } from 'helpers/helpers.js';

const checkConsistency = (matrices: PairwiseComparisonMatrix[]): boolean => {
  const checkResults = [] as boolean[];
  for (const matrix of matrices) {
    const lambdaMax = calculateLambdaMax(matrix);
    const isConsistent = checkConsistencyIndex(matrix, lambdaMax);
    checkResults.push(isConsistent);
  }
  return checkResults.filter(Boolean).length === checkResults.length;
};

export { checkConsistency };
