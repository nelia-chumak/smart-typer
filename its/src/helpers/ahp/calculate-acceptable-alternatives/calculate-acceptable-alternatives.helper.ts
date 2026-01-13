import { AlternativePrioritiesVector } from 'common/types/types.js';

const calculateAcceptableAlternatives = (
  globalPrioritiesWithIds: AlternativePrioritiesVector,
): AlternativePrioritiesVector => {
  const n = globalPrioritiesWithIds.length;

  if (n <= 1) {
    return [...globalPrioritiesWithIds];
  }

  const sorted = [...globalPrioritiesWithIds].sort((a, b) => a.value - b.value);

  const best = sorted[n - 1];
  const threshold = 1 / (n - 1);

  return sorted.filter((alt) => best.value - alt.value < threshold);
};

export { calculateAcceptableAlternatives };
