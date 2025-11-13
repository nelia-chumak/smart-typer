import {
  SkillLessonStatistics,
  SkillWillLearnProbability,
} from 'common/types/types.js';

type SkillStatisticsWithWillLearnProbability = SkillLessonStatistics &
  SkillWillLearnProbability;

export type { SkillStatisticsWithWillLearnProbability };
