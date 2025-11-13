import {
  SkillKnownProbability,
  SkillLessonStatistics,
  SkillsGuessProbability,
} from 'common/types/types.js';

const calculateGuessProbability = (
  skills: SkillKnownProbability[],
): SkillsGuessProbability => {
  const skillsPGuess = skills.map(({ skillId, pKnown }) => {
    const pGuess = 0.19 * (1 - pKnown) + 0.01;
    return [skillId, pGuess] as [SkillLessonStatistics['skillId'], number];
  });
  return new Map(skillsPGuess);
};

export { calculateGuessProbability };
