import { CommonKey, SkillKey } from 'common/enums/enums';
import { BktResult, IrtResult, Skill } from 'common/types/types';

const calculateLessonBestSkill = (
  currentSkillLevels: Omit<Skill, SkillKey.NAME>[],
  resultSkillLevels: IrtResult | BktResult,
  lessonSkillIds: Skill[CommonKey.ID][],
): Skill[CommonKey.ID] => {
  const lessonSkillIdSet = new Set(lessonSkillIds);

  const lessonCurrentLevels = currentSkillLevels.filter(({ id }) =>
    lessonSkillIdSet.has(id),
  );

  const deltas = lessonCurrentLevels.map(({ id, level }) => {
    const resultLevel = resultSkillLevels.find((x) => x.skillId === id);
    const delta = resultLevel ? resultLevel.pKnown - level : 0;
    return { id, level, delta };
  });

  const allZero = deltas.length > 0 && deltas.every((x) => x.delta === 0);

  if (allZero) {
    const firstLevelOne = deltas.find((x) => x.level === 1);
    if (firstLevelOne) return firstLevelOne.id;

    return deltas[0]?.id ?? lessonSkillIds[0];
  }

  const best = deltas.sort((a, b) => a.delta - b.delta).pop();
  return best?.id ?? lessonSkillIds[0];
};

export { calculateLessonBestSkill };
