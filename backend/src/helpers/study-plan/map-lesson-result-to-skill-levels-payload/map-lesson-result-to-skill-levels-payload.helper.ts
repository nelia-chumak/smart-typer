import { SkillKey } from 'common/enums/enums';
import {
  LessonWithSkills,
  Skill,
  SkillLessonStatistics,
} from 'common/types/types';

type MapLessonResultItsPayload = {
  lesson: LessonWithSkills;
  misclicks: boolean[];
  timestamps: number[];
  currentSkillLevels: Omit<Skill, SkillKey.NAME>[];
};

const mapLessonResultToSkillLevelsPayload = ({
  lesson,
  misclicks,
  timestamps,
  currentSkillLevels,
}: MapLessonResultItsPayload): SkillLessonStatistics[] => {
  return lesson.skills.map(({ id, name, count }) => {
    const pKnown = currentSkillLevels.find((skill) => id === skill.id)
      ?.level as number;

    const startIndexes = [
      ...lesson.content.matchAll(new RegExp(name, 'gi')),
    ].map((result) => result.index);

    const indexes = startIndexes.reduce((indexes, index) => {
      const nextIndexes = [...name].map((_, i) => i + index);
      return indexes.concat(nextIndexes);
    }, [] as number[]);

    const m = misclicks.filter(
      (value, i) => indexes.includes(i) && value,
    ).length;

    const skillTimestamps = indexes.map(
      (index) => timestamps[index + 1] - timestamps[index],
    );

    const skillTimestampsSum = skillTimestamps.reduce(
      (partSum, value) => partSum + value,
      0,
    );
    const t = skillTimestampsSum / skillTimestamps.length;

    return {
      m,
      t,
      n: count,
      skillId: id,
      pKnown,
    };
  });
};

export { mapLessonResultToSkillLevelsPayload };
