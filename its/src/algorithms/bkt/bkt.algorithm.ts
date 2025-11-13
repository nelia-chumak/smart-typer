import { BktPayload, BktResult } from 'common/types/types.js';
import {
  calculateGuessProbability,
  calculateSlipProbability,
  calculateLearnedProbability,
  calculateWillLearnProbability,
} from 'helpers/helpers.js';

const bkt = (payload: BktPayload): BktResult => {
  const skillsWillLearnProbability = calculateWillLearnProbability(payload);

  const skillsPGuess = calculateGuessProbability(payload);

  const skillsPSlip = calculateSlipProbability(payload);

  const skillsWillLearnAndKnowProbability = payload.map((skill) => {
    const { pWillLearn } = skillsWillLearnProbability.find(
      ({ skillId }) => skill.skillId === skillId,
    )!;
    return { ...skill, pWillLearn };
  });
  const skillsLearnedProbability = calculateLearnedProbability({
    skills: skillsWillLearnAndKnowProbability,
    skillsPGuess,
    skillsPSlip,
  });

  const result = skillsLearnedProbability.map(({ skillId, pLearned }) => ({
    skillId,
    pKnown: pLearned,
  }));
  return result;
};

export { bkt };
