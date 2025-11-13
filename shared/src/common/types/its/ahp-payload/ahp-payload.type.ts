import { AhpLesson, AhpSkillLevel } from 'common/types/types.js';

type AhpPayload = {
  lessons: AhpLesson[];
  lastFinishedLessonIds: number[];
  skillLevels: AhpSkillLevel[];
};

export type { AhpPayload };
