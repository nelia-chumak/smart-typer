import { TEST_LESSON_NAMES } from 'common/constants/constants.js';
import { IrtPayload } from 'common/types/types.js';

const calculateLessonComplexity = (
  lessonName: IrtPayload['lessonName'],
): number => {
  const [firstLessonName, secondLessonName, thirdLessonName] =
    TEST_LESSON_NAMES;
  switch (lessonName) {
    case firstLessonName:
      return -1;
    case secondLessonName:
      return 0;
    case thirdLessonName:
      return 1;
    default:
      return 0;
  }
};

export { calculateLessonComplexity };
