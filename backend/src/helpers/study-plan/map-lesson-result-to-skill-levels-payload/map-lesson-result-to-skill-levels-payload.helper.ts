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
  return lesson.skills.map(({ id, name }) => {
    const pKnown =
      (currentSkillLevels.find((skill) => id === skill.id)?.level as number) ??
      0;

    const startIndexes = [...lesson.content.matchAll(new RegExp(name, 'gi'))]
      .map((result) => result.index)
      .filter((x): x is number => x !== undefined);

    const m = startIndexes.filter((start) => {
      for (let j = 0; j < name.length; j++) {
        if (misclicks[start + j]) return true;
      }
      return false;
    }).length;

    const deltas: number[] = [];
    for (const start of startIndexes) {
      for (let j = 0; j < name.length; j++) {
        const idx = start + j;
        const dt = timestamps[idx + 1] - timestamps[idx];
        if (Number.isFinite(dt)) deltas.push(dt);
      }
    }

    const t =
      deltas.length > 0
        ? deltas.reduce((sum, v) => sum + v, 0) / deltas.length
        : 0;

    return {
      m,
      t,
      n: startIndexes.length,
      skillId: id,
      pKnown,
    };
  });
};

export { mapLessonResultToSkillLevelsPayload };
