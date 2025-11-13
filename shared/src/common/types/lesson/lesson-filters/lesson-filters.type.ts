import { LessonKey } from 'common/enums/enums.js';
import { LessonDto } from 'common/types/types.js';

type LessonFilters = Partial<
  Pick<LessonDto, LessonKey.CREATOR_TYPE | LessonKey.CONTENT_TYPE>
>;

export type { LessonFilters };
