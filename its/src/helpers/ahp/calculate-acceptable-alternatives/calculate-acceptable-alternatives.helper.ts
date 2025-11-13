import { AlternativePrioritiesVector } from 'common/types/types.js';

const calculateAcceptableAlternatives = (
  globalPrioritiesWithIds: AlternativePrioritiesVector,
): AlternativePrioritiesVector => {
  const globalPrioritiesLength = globalPrioritiesWithIds.length;
  const bestAlternative = globalPrioritiesWithIds.pop()!;

  const globalPrioritiesResult = globalPrioritiesWithIds.filter(
    (globalPriority) =>
      bestAlternative.value - globalPriority.value <
      1 / (globalPrioritiesLength - 1),
  );

  return [...globalPrioritiesResult, bestAlternative];
};

export { calculateAcceptableAlternatives };
