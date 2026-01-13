import {
  AhpLesson,
  CriterionPrioritiesVector,
  PrioritiesVector,
} from 'common/types/types.js';
import { calculateSimilarityCriterion } from 'helpers/helpers.js';

const EPS = 1e-6;

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
      sum + value * (1 / Math.max(similarityCriteria.get(skillId)!, EPS)),
    0,
  );
  const bayesianLocalPriorities = oldCriterionLocalPrioritiesWithIds.map(
    ({ skillId, value }) =>
      (value * (1 / Math.max(similarityCriteria.get(skillId)!, EPS))) /
      denominator,
  );

  return bayesianLocalPriorities;
};

export { calculateBayesianLocalPriorities };
