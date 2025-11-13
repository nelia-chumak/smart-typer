import { LessonDto } from 'common/types/types.js';

type StudyPlanLesson = LessonDto & {
  averageSpeed: number;
  isFinished: boolean;
};

export type { StudyPlanLesson };
