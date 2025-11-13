import { CommonKey, LessonKey } from 'common/enums/enums.js';
import { LessonDto } from 'common/types/types.js';

type LessonResponseDto = Pick<
  LessonDto,
  CommonKey.ID | LessonKey.NAME | LessonKey.CONTENT
>;

export type { LessonResponseDto };
