import { SkillLessonStatistics } from 'common/types/types.js';

type SkillKnownProbability = {
  skillId: SkillLessonStatistics['skillId'];
  pKnown: number;
};

export type { SkillKnownProbability };
