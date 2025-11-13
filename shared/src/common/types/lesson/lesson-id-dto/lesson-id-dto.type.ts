import { CommonKey } from 'common/enums/enums.js';
import { LessonDto } from 'common/types/types.js';

type LessonIdDto = {
  lessonId: LessonDto[CommonKey.ID];
};

export type { LessonIdDto };
