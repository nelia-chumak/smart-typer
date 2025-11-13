import { SkillLessonStatistics } from 'common/types/types.js';

type SkillWillLearnProbability = {
  skillId: SkillLessonStatistics['skillId'];
  pWillLearn: number;
};

export type { SkillWillLearnProbability };
