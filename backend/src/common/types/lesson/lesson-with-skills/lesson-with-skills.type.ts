import { CommonKey, SkillKey } from 'common/enums/enums';
import { LessonResponseDto, Skill } from 'common/types/types';

type LessonWithSkills = LessonResponseDto & {
  skills: (Pick<Skill, CommonKey.ID | SkillKey.NAME> & { count: number })[];
};

export type { LessonWithSkills };
