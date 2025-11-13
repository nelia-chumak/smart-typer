import { SkillLessonStatistics } from 'common/types/types.js';

type SkillLearnedProbability = {
  skillId: SkillLessonStatistics['skillId'];
  pLearned: number;
};

export type { SkillLearnedProbability };
