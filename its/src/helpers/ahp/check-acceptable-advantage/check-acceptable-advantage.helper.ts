import { AlternativePrioritiesVector } from 'common/types/types.js';

const checkAcceptableAdvantage = (
  globalPrioritiesWithIds: AlternativePrioritiesVector,
): boolean => {
  const nextBestValue =
    globalPrioritiesWithIds[globalPrioritiesWithIds.length - 2].value;
  const bestValue = [...globalPrioritiesWithIds].pop()!.value;

  const globalPrioritiesLength = globalPrioritiesWithIds.length;

  const hasAcceptableAdvantage =
    bestValue - nextBestValue >= 1 / (globalPrioritiesLength - 1);

  return hasAcceptableAdvantage;
};

export { checkAcceptableAdvantage };
