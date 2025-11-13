import {
  SkillLearnedProbability,
  SkillStatisticsWithWillLearnProbability,
  SkillsGuessProbability,
  SkillsSlipProbability,
} from 'common/types/types.js';
import { calculateSkillConditionalPreviousLearnedProbability } from '../calculate-skill-conditional-previous-learned-probability/calculate-skill-conditional-previous-learned-probability.helper.js';

type CalculateLearnedProbabilityProps = {
  skills: SkillStatisticsWithWillLearnProbability[];
  skillsPGuess: SkillsGuessProbability;
  skillsPSlip: SkillsSlipProbability;
};

const calculateLearnedProbability = ({
  skills,
  skillsPGuess,
  skillsPSlip,
}: CalculateLearnedProbabilityProps): SkillLearnedProbability[] => {
  return skills.map(({ skillId, pKnown, m, n, pWillLearn }) => {
    const c = n - m;
    const pGuess = skillsPGuess.get(skillId)!;
    const pSlip = skillsPSlip.get(skillId)!;
    // prettier-ignore
    const pLearnedPreviousCorrect = c
      ? calculateSkillConditionalPreviousLearnedProbability({
        pGuess,
        pSlip,
        pKnown,
        isCorrect: true,
      })
      : 0;
    // prettier-ignore
    const pLearnedPreviousIncorrect = m
      ? calculateSkillConditionalPreviousLearnedProbability({
        pGuess,
        pSlip,
        pKnown,
        isCorrect: false,
      })
      : 0;
    const pLearnedPrevious =
      (pLearnedPreviousCorrect * c + pLearnedPreviousIncorrect * m) / n;
    const pLearned = pLearnedPrevious + (1 - pLearnedPrevious) * pWillLearn;
    return { skillId, pLearned };
  });
};

export { calculateLearnedProbability };
