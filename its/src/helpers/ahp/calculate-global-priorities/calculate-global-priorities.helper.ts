import * as math from 'mathjs';
import { PrioritiesVector } from 'common/types/types.js';

const calculateGlobalPriorities = (
  criterionLocalPriorities: PrioritiesVector,
  transposedAlternativeLocalPriorityMatrix: PrioritiesVector[],
): PrioritiesVector => {
  const globalPriorities = [] as PrioritiesVector;

  for (const criterionLocalPrioritiesByAlternatives of transposedAlternativeLocalPriorityMatrix) {
    const adjustedCriterionPriorities = [];
    for (let i = 0; i < criterionLocalPriorities.length; i++) {
      adjustedCriterionPriorities.push(
        criterionLocalPrioritiesByAlternatives[i] * criterionLocalPriorities[i],
      );
    }
    globalPriorities.push(math.sum(adjustedCriterionPriorities));
  }

  return globalPriorities;
};

export { calculateGlobalPriorities };
