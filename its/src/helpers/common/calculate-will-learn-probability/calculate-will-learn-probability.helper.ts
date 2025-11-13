import {
  SkillLessonStatistics,
  SkillWillLearnProbability,
} from 'common/types/types.js';

const calculateWillLearnProbability = (
  skills: SkillLessonStatistics[],
): SkillWillLearnProbability[] => {
  return skills.map(({ skillId, m, n, t: time }) => {
    const t = time < 1 / 200 ? 1 / 200 : time;
    const w = m / n < 5 / 100 ? 5 / 100 : m / n;
    const pWillLearn = (1 - w) * (100 / 95) * 0.5 + (1 / (200 * t)) * 0.5;
    return {
      skillId,
      pWillLearn,
    };
  });
};

export { calculateWillLearnProbability };
