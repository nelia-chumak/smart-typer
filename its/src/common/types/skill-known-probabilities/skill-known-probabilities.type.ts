import {
  SkillKnownProbabilityForLesson,
  SkillLessonStatistics,
} from 'common/types/types.js';

type SkillKnownProbabilities = SkillKnownProbabilityForLesson & {
  pKnown: SkillLessonStatistics['pKnown'];
};

export type { SkillKnownProbabilities };
