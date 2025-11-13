import {
  SkillKnownProbability,
  SkillLessonStatistics,
  SkillsSlipProbability,
} from 'common/types/types.js';

const calculateSlipProbability = (
  skills: SkillKnownProbability[],
): SkillsSlipProbability => {
  const skillsPSlip = skills.map(({ skillId, pKnown }) => {
    const pSlip = 0.19 * pKnown + 0.01;
    return [skillId, pSlip] as [SkillLessonStatistics['skillId'], number];
  });
  return new Map(skillsPSlip);
};

export { calculateSlipProbability };
