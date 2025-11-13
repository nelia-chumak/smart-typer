import * as math from 'mathjs';
import { PairwiseComparisonMatrix, PrioritiesVector } from 'common/types/types.js';

const calculateLocalPriorities = (
  matrix: PairwiseComparisonMatrix,
): PrioritiesVector => {
  const localPriorities = [] as PrioritiesVector;
  const weightedLocalPriorities = [] as PrioritiesVector;

  for (const row of matrix) {
    const priority = Math.pow(math.prod(row), 1 / matrix.length);
    localPriorities.push(priority);
  }

  const localPrioritiesSum = math.sum(localPriorities);

  for (const localPriority of localPriorities) {
    weightedLocalPriorities.push(localPriority / localPrioritiesSum);
  }

  return weightedLocalPriorities;
};

export { calculateLocalPriorities };
