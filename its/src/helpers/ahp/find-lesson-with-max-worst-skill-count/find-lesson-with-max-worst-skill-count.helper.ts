import { AhpLesson, AhpSkillLevel } from 'common/types/types.js';

const findLessonWithMaxWorstSkillCount = (
  lessons: AhpLesson[],
  skillLevels: AhpSkillLevel[],
): AhpLesson => {
  const skillWithMinLevel = skillLevels.reduce(
    (skillWithMinLevel, skill) =>
      skill.level < skillWithMinLevel.level ? skill : skillWithMinLevel,
    skillLevels[0],
  );

  const lessonsWithWorstSkill = lessons.reduce((filteredLessons, lesson) => {
    const skillCount = lesson.skillsCountInLesson.find(
      (skill) => skill.skillId === skillWithMinLevel.skillId,
    );
    if (skillCount) {
      filteredLessons.push({
        ...lesson,
        skillsCountInLesson: [skillCount],
      });
    }
    return filteredLessons;
  }, [] as AhpLesson[]);

  const lessonWithMaxWorstSkillCount = lessonsWithWorstSkill.reduce(
    (lessonWithMaxWorstSkillCount, lesson) => {
      const countForWorstSkill = [...lesson.skillsCountInLesson].pop()!.count;
      const maxCountForWorstSkill = [
        ...lessonWithMaxWorstSkillCount.skillsCountInLesson,
      ].pop()!.count;
      return countForWorstSkill > maxCountForWorstSkill
        ? lesson
        : lessonWithMaxWorstSkillCount;
    },
    lessonsWithWorstSkill[0],
  );

  return lessonWithMaxWorstSkillCount;
};

export { findLessonWithMaxWorstSkillCount };
