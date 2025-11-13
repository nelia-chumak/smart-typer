import { ContentType, CreatorType } from 'common/enums/enums.js';

type LessonDto = {
  id: number;
  name: string;
  contentType: ContentType;
  creatorType: CreatorType;
  content: string;
  bestSkill: string | null;
};

export type { LessonDto };
