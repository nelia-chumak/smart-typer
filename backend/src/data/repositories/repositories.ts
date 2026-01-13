import {
  Lesson as LessonModel,
  RefreshToken as RefreshTokenModel,
  Room as RoomModel,
  Settings as SettingsModel,
  Skill as SkillModel,
  Statistics as StatisticsModel,
  User as UserModel,
  UserToFinishedLesson as UserToFinishedLessonModel,
  UserToStudyPlanLesson as UserToStudyPlanLessonModel,
} from 'data/models/models';

import { Lesson } from './lesson/lesson.repository';
import { RefreshToken } from './refresh-token/refresh-token.repository';
import { Room } from './room/room.repository';
import { Settings } from './settings/settings.repository';
import { Skill } from './skill/skill.repository';
import { Statistics } from './statistics/statistics.repository';
import { User } from './user/user.repository';

const refreshToken = new RefreshToken({
  RefreshTokenModel,
});

const settings = new Settings({ SettingsModel });

const statistics = new Statistics({ StatisticsModel });

const skill = new Skill({ SkillModel });

const room = new Room({ RoomModel });

const lesson = new Lesson({
  LessonModel,
  UserToFinishedLessonModel,
  UserToStudyPlanLessonModel,
});

const user = new User({
  UserModel,
  skillRepository: skill,
  roomRepository: room,
  lessonRepository: lesson,
});

export { lesson, refreshToken, room, settings, skill, statistics, user };
