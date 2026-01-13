import {
  MILLISECONDS_IN_SECOND,
  SECONDS_IN_MINUTE,
} from 'common/constants/constants';
import {
  LessonDisplayedResult,
  LessonWithSkillsStatistics,
} from 'common/types/types';
import { getMinutesFromMilliseconds } from '../helpers';

const mapLessonStatisticsToResults = (
  lesson: LessonWithSkillsStatistics,
): LessonDisplayedResult => {
  const { content, misclicks, timestamps } = lesson;

  const firstTimestamp = timestamps[0];
  const lastTimestamp = timestamps[timestamps.length - 1];

  const rawDuration = (lastTimestamp ?? 0) - (firstTimestamp ?? 0);

  const safeDuration = Math.max(rawDuration, 1000);

  const minutes = safeDuration / MILLISECONDS_IN_SECOND / SECONDS_IN_MINUTE;

  const averageSpeed = Math.round(content.length / minutes);

  const totalTime = Math.max(rawDuration, 1000);

  const totalSymbols = content.length;
  const misclickSymbols = misclicks.filter(Boolean).length;
  const correctSymbols = totalSymbols - misclickSymbols;

  return {
    averageSpeed,
    totalSymbols,
    correctSymbols,
    misclickSymbols,
    totalTime: getMinutesFromMilliseconds(totalTime),
  };
};

export { mapLessonStatisticsToResults };
