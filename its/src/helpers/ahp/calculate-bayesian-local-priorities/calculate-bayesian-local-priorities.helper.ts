import {
  AhpLesson,
  CriterionPrioritiesVector,
  PrioritiesVector,
} from 'common/types/types.js';
import { calculateSimilarityCriterion } from 'helpers/helpers.js';

const calculateBayesianLocalPriorities = (
  oldCriterionLocalPrioritiesWithIds: CriterionPrioritiesVector,
  lastFinishedLessons: AhpLesson[],
): PrioritiesVector => {
  const similarityCriteria = new Map(
    oldCriterionLocalPrioritiesWithIds.map(({ skillId }) => {
      const similarityCriterion = calculateSimilarityCriterion(
        lastFinishedLessons,
        skillId,
      );
      return [skillId, similarityCriterion];
    }),
  );
  const denominator = oldCriterionLocalPrioritiesWithIds.reduce(
    (sum, { skillId, value }) =>
      sum + value * (1 / similarityCriteria.get(skillId)!),
    0,
  );
  const bayesianLocalPriorities = oldCriterionLocalPrioritiesWithIds.map(
    ({ skillId, value }) =>
      (value * (1 / similarityCriteria.get(skillId)!)) / denominator,
  );

  return bayesianLocalPriorities;
};

export { calculateBayesianLocalPriorities };
