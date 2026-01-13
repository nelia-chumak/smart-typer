import { AhpPayload, AhpResult } from 'common/types/types.js';
import {
  calculateAcceptableAlternatives,
  calculateAlternativePairwiseComparisonMatrices,
  calculateBayesianLocalPriorities,
  calculateCriterionPairwiseComparisonMatrix,
  calculateGlobalPriorities,
  calculateLocalPriorities,
  checkAcceptableAdvantage,
  checkConsistency,
  findLessonWithMaxWorstSkillCount,
} from 'helpers/helpers.js';
import * as math from 'mathjs';

const ahp = (payload: AhpPayload): AhpResult => {
  const { lessons, lastFinishedLessonIds, skillLevels } = payload;

  if (lessons.length === 1) {
    return { lessonId: lessons[0].lessonId };
  }

  const criterionMpc = calculateCriterionPairwiseComparisonMatrix(skillLevels);
  const alternativeMpcs = calculateAlternativePairwiseComparisonMatrices(
    lessons,
    skillLevels,
  );
  const areConsistent = checkConsistency([...alternativeMpcs, criterionMpc]);
  if (!areConsistent) {
    const { lessonId } = findLessonWithMaxWorstSkillCount(lessons, skillLevels);
    return { lessonId };
  }

  const criterionLocalPriorities = calculateLocalPriorities(criterionMpc);
  const alternativeLocalPriorityMatrix = alternativeMpcs.map((alternativeMpc) =>
    calculateLocalPriorities(alternativeMpc),
  );
  const transposedAlternativeLocalPriorityMatrix = math.transpose(
    alternativeLocalPriorityMatrix,
  );

  const globalPriorities = calculateGlobalPriorities(
    criterionLocalPriorities,
    transposedAlternativeLocalPriorityMatrix,
  );
  const globalPrioritiesWithIds = globalPriorities
    .map((value, index) => ({
      value,
      lessonId: lessons[index].lessonId,
    }))
    .sort((a, b) => a.value - b.value);

  const bestLesson = [...globalPrioritiesWithIds].pop()!;
  const hasAcceptableAdvantage = checkAcceptableAdvantage(
    globalPrioritiesWithIds,
  );
  if (hasAcceptableAdvantage) {
    const { lessonId } = bestLesson;
    return { lessonId };
  }

  const acceptableAlternatives = calculateAcceptableAlternatives(
    globalPrioritiesWithIds,
  );

  const acceptableLocalPriorityMatrix = transposedAlternativeLocalPriorityMatrix
    .map((row, index) => ({
      row,
      lessonId: lessons[index].lessonId,
    }))
    .filter(({ lessonId }) =>
      acceptableAlternatives.find((priority) => priority.lessonId === lessonId),
    )
    .map(({ row }) => row);

  const criterionLocalPrioritiesWithIds = criterionLocalPriorities
    .map((value, index) => ({
      value,
      skillId: skillLevels[index].skillId,
    }))
    .sort((a, b) => a.value - b.value);

  const lastFinishedLessons = lessons.filter(({ lessonId }) =>
    lastFinishedLessonIds.includes(lessonId),
  );

  const bayesianCriterionLocalPriorities = calculateBayesianLocalPriorities(
    criterionLocalPrioritiesWithIds,
    lastFinishedLessons,
  );

  const bayesianGlobalPriorities = calculateGlobalPriorities(
    bayesianCriterionLocalPriorities,
    acceptableLocalPriorityMatrix,
  );
  const bayesianGlobalPrioritiesWithIds = bayesianGlobalPriorities
    .map((value, index) => ({
      value,
      lessonId: lessons[index].lessonId,
    }))
    .sort((a, b) => a.value - b.value);

  const bayesianBestLesson = [...bayesianGlobalPrioritiesWithIds].pop()!;
  const { lessonId } = bayesianBestLesson;
  return { lessonId };
};

export { ahp };
