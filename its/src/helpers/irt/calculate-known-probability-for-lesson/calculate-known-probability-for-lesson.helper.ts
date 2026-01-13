import {
  IrtPayload,
  SkillKnownProbabilityForLesson,
  SkillWillLearnProbability,
} from 'common/types/types.js';
import { calculateLessonComplexity } from '../calculate-lesson-complexity/calculate-lesson-complexity.helper.js';

type CalculateWillLearnProbabilityProps = {
  lessonName: IrtPayload['lessonName'];
  skills: SkillWillLearnProbability[];
};

const EPS = 1e-6;

const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x));

const clampProbOpen = (p: number): number => {
  if (p <= 0) return EPS;
  if (p >= 1) return 1 - EPS;
  return p;
};

const calculateKnownProbabilityForLesson = ({
  lessonName,
  skills,
}: CalculateWillLearnProbabilityProps): SkillKnownProbabilityForLesson[] => {
  const complexity = calculateLessonComplexity(lessonName);

  return skills.map(({ skillId, pWillLearn }) => {
    const p = clampProbOpen(pWillLearn);

    const logit = Math.log(p / (1 - p));
    const knowledgeLevel = complexity + logit;

    const pKnownLesson = sigmoid(knowledgeLevel);
    return { skillId, pKnownLesson };
  });
};

export { calculateKnownProbabilityForLesson };
