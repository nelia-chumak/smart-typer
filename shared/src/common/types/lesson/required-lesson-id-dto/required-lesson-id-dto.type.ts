import { CommonKey } from 'common/enums/enums.js';
import { LessonDto } from 'common/types/types.js';

type RequiredLessonIdDto = {
  lessonId: NonNullable<LessonDto[CommonKey.ID]>;
};

export type { RequiredLessonIdDto };
