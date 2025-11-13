import { IrtPayload, IrtResult } from 'common/types/types.js';
import {
  calculateKnownProbabilityForLesson,
  calculateWillLearnProbability,
  calculateKnownProbability,
} from 'helpers/helpers.js';

const irt = (payload: IrtPayload): IrtResult => {
  const { skills, lessonName } = payload;
  const skillsWillLearnProbability = calculateWillLearnProbability(skills);

  const skillsKnownProbabilityForLesson = calculateKnownProbabilityForLesson({
    skills: skillsWillLearnProbability,
    lessonName,
  });

  const skillsKnownProbabilities = skills.map(({ skillId, pKnown }) => {
    const { pKnownLesson } = skillsKnownProbabilityForLesson.find(
      (skill) => skill.skillId === skillId,
    )!;
    return {
      skillId,
      pKnown,
      pKnownLesson,
    };
  });

  const result = calculateKnownProbability(skillsKnownProbabilities);
  return result;
};

export { irt };
