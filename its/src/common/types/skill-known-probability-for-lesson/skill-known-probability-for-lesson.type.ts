import { SkillLessonStatistics } from 'common/types/types.js';

type SkillKnownProbabilityForLesson = {
  skillId: SkillLessonStatistics['skillId'];
  pKnownLesson?: number;
};

export type { SkillKnownProbabilityForLesson };
