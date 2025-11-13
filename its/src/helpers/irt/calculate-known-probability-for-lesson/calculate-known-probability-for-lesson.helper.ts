import {
  IrtPayload,
  SkillKnownProbabilityForLesson,
  SkillWillLearnProbability,
} from 'common/types/types.js';
import { calculateLessonComplexity } from '../calculate-lesson-complexity/calculate-lesson-complexity.helper.js';
import { solveEquation } from '../solve-equation/solve-equation.helper.js';

type CalculateWillLearnProbabilityProps = {
  lessonName: IrtPayload['lessonName'];
  skills: SkillWillLearnProbability[];
};

const calculateKnownProbabilityForLesson = ({
  lessonName,
  skills,
}: CalculateWillLearnProbabilityProps): SkillKnownProbabilityForLesson[] => {
  return skills.map(({ skillId, pWillLearn }) => {
    const complexity = calculateLessonComplexity(lessonName);
    const knowledgeLevel = solveEquation(
      `e^(x - ${complexity})/(1+e^(x - ${complexity})) - ${pWillLearn}`,
      `e^(x - ${complexity})/(1+e^(x - ${complexity}))`,
    );
    const pKnownLesson = knowledgeLevel
      ? knowledgeLevel / 5 + 0.5
      : knowledgeLevel;

    return {
      skillId,
      pKnownLesson,
    };
  });
};

export { calculateKnownProbabilityForLesson };
