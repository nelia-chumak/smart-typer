import { ContentType } from 'common/enums/enums.js';
import { AhpSkillCountInLesson } from 'common/types/types.js';

type AhpLesson = {
  lessonId: number;
  contentType: ContentType;
  skillsCountInLesson: AhpSkillCountInLesson[];
};

export type { AhpLesson };
