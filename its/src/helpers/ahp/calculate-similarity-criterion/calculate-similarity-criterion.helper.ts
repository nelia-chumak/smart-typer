import { AhpLesson } from 'common/types/types.js';

const calculateSimilarityCriterion = (
  lastFinishedLessons: AhpLesson[],
  skillId: number,
): number => {
  let result = 0;
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 5; j++) {
      const firstCount =
        lastFinishedLessons[i].skillsCountInLesson.find(
          (skill) => skill.skillId === skillId,
        )?.count ?? 0;
      const secondCount =
        lastFinishedLessons[j].skillsCountInLesson.find(
          (skill) => skill.skillId === skillId,
        )?.count ?? 0;
      result += Math.abs(firstCount - secondCount);
    }
  }
  return result / 10;
};

export { calculateSimilarityCriterion };
