import { LessonKey } from 'common/enums/enums.js';
import { LessonDto, SkillLessonStatistics } from 'common/types/types.js';

type IrtPayload = {
  skills: SkillLessonStatistics[];
  lessonName: LessonDto[LessonKey.NAME];
};

export type { IrtPayload };
