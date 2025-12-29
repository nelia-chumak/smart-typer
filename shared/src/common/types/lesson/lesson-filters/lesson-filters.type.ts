import { LessonKey, LessonViewKey } from 'common/enums/enums.js';
import { LessonDto } from 'common/types/types.js';

type LessonFilters = Partial<
  Pick<LessonDto, LessonViewKey.CREATOR_TYPE | LessonKey.CONTENT_TYPE>
>;

export type { LessonFilters };
