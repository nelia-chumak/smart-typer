import { LessonDto } from 'common/types/types.js';

type CreateLessonRequestDto = Pick<
  LessonDto,
  'name' | 'contentType' | 'content'
>;

export type { CreateLessonRequestDto };
