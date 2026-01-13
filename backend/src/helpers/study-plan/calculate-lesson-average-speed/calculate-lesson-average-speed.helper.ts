import {
  MILLISECONDS_IN_SECOND,
  SECONDS_IN_MINUTE,
} from 'common/constants/constants';

const calculateLessonAverageSpeed = (
  lessonContent: string,
  timestamps: number[],
): number => {
  const firstTimestamp = timestamps[0];
  const lastTimestamp = timestamps[timestamps.length - 1];

  const rawDuration = (lastTimestamp ?? 0) - (firstTimestamp ?? 0);

  const safeDuration = Math.max(rawDuration, 1000);

  const minutes = safeDuration / MILLISECONDS_IN_SECOND / SECONDS_IN_MINUTE;

  return Math.round(lessonContent.length / minutes);
};

export { calculateLessonAverageSpeed };
