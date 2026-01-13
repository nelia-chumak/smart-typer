import { AhpLesson } from 'common/types/types.js';

const calculateSimilarityCriterion = (
  lastLessons: AhpLesson[],
  skillId: number,
): number => {
  const n = lastLessons.length;
  if (n < 2) return 1;

  let sum = 0;
  let pairs = 0;

  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const a =
        lastLessons[i].skillsCountInLesson.find((s) => s.skillId === skillId)
          ?.count ?? 0;
      const b =
        lastLessons[j].skillsCountInLesson.find((s) => s.skillId === skillId)
          ?.count ?? 0;
      sum += Math.abs(a - b);
      pairs++;
    }
  }

  return pairs > 0 ? sum / pairs : 1;
};

export { calculateSimilarityCriterion };
