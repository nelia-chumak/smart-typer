import { TEST_LESSON_NAMES } from 'common/constants/constants';
import {
  CommonKey,
  HttpCode,
  HttpErrorMessage,
  SkillKey,
} from 'common/enums/enums';
import {
  IPaginationRequest,
  IPaginationResponse,
} from 'common/interfaces/interfaces';
import {
  CreateLessonRequestDto,
  FinishedLesson,
  LessonDto,
  LessonFilters,
  LessonResponseDto,
  RequiredLessonIdDto,
  Skill,
  SkillsStatisticsDto,
  UserDto,
} from 'common/types/types';
import { lesson as lessonRepository } from 'data/repositories/repositories';
import { HttpError } from 'exceptions/exceptions';
import {
  calculateLessonAverageSpeed,
  calculateLessonBestSkill,
  calculateStatistics,
  mapLessonResultToSkillLevelsPayload,
  mapLessonsToNextStudyPlanLessonPayload,
} from 'helpers/helpers';
import {
  its as itsService,
  statistics as statisticsService,
  user as userService,
} from 'services/services';

type Constructor = {
  lessonRepository: typeof lessonRepository;
  itsService: typeof itsService;
  userService: typeof userService;
  statisticsService: typeof statisticsService;
};

class Lesson {
  private _lessonRepository: typeof lessonRepository;
  private _itsService: typeof itsService;
  private _userService: typeof userService;
  private _statisticsService: typeof statisticsService;

  public constructor(params: Constructor) {
    this._lessonRepository = params.lessonRepository;
    this._itsService = params.itsService;
    this._userService = params.userService;
    this._statisticsService = params.statisticsService;
  }

  public async get(
    lessonId: LessonDto[CommonKey.ID],
  ): Promise<LessonResponseDto> {
    const lesson = await this._lessonRepository.getById(lessonId);

    if (!lesson) {
      throw new HttpError({
        status: HttpCode.NOT_FOUND,
        message: HttpErrorMessage.NO_LESSON_WITH_SUCH_ID,
      });
    }
    return lesson;
  }

  public async delete(
    userId: UserDto[CommonKey.ID],
    lessonId: LessonDto[CommonKey.ID],
  ): Promise<void> {
    const deletedLessonId = await this._lessonRepository.deleteByIdAndOwnerId(
      userId,
      lessonId,
    );

    if (!deletedLessonId) {
      throw new HttpError({
        status: HttpCode.BAD_REQUEST,
        message: HttpErrorMessage.NO_LESSON_WITH_SUCH_ID,
      });
    }
  }

  public async create(
    userId: UserDto[CommonKey.ID],
    payload: CreateLessonRequestDto,
  ): Promise<LessonResponseDto> {
    return this._lessonRepository.create(userId, payload);
  }

  public async getMore(
    userId: UserDto[CommonKey.ID],
    payload: IPaginationRequest & LessonFilters,
  ): Promise<IPaginationResponse<LessonDto>> {
    return this._lessonRepository.getPaginated(userId, payload);
  }

  public async getStudyPlan(
    userId: UserDto[CommonKey.ID],
  ): Promise<LessonDto[]> {
    const areTestLessons = true;
    const testLessons = await this._lessonRepository.getStudyPlanByUserId(
      userId,
      areTestLessons,
    );
    const passedTestLessons = testLessons.filter(
      (testLesson) => testLesson.bestSkill,
    );
    if (passedTestLessons.length === TEST_LESSON_NAMES.length) {
      return this._lessonRepository.getStudyPlanByUserId(userId);
    } else {
      return testLessons;
    }
  }

  private async _upsertFinished(
    lessonId: LessonDto[CommonKey.ID],
    payload: FinishedLesson,
  ): Promise<void> {
    const { userId, bestSkillId, averageSpeed } = payload;
    const finishedLesson =
      await this._lessonRepository.getFinishedByIdAndUserId(lessonId, userId);

    if (finishedLesson) {
      await this._lessonRepository.updateFinished(lessonId, {
        userId,
        bestSkillId,
        averageSpeed,
      });
    } else {
      await this._lessonRepository.insertFinished(lessonId, {
        userId,
        bestSkillId,
        averageSpeed,
      });
    }
  }

  public async handleResult(
    userId: UserDto[CommonKey.ID],
    lessonId: LessonDto[CommonKey.ID],
    payload: SkillsStatisticsDto,
  ): Promise<void> {
    const { misclicks, timestamps } = payload;
    const lesson = await this._lessonRepository.getByIdWithSkills(lessonId);
    if (!lesson) {
      throw new HttpError({
        status: HttpCode.NOT_FOUND,
        message: HttpErrorMessage.NO_LESSON_WITH_SUCH_ID,
      });
    }

    const currentSkillLevels =
      await this._userService.getCurrentSkillLevels(userId);

    const skillLevelsPayload = mapLessonResultToSkillLevelsPayload({
      lesson,
      misclicks,
      timestamps,
      currentSkillLevels,
    });

    const isTestLesson = TEST_LESSON_NAMES.includes(lesson.name);
    const isLastTestLesson = lesson.name === [...TEST_LESSON_NAMES].pop();

    const resultSkillLevels = isTestLesson
      ? await this._itsService.irt({
          skills: skillLevelsPayload,
          lessonName: lesson.name,
        })
      : await this._itsService.bkt(skillLevelsPayload);

    await this._userService.updateSkillLevels(
      userId,
      resultSkillLevels.map((skill) => ({
        id: skill.skillId,
        level: skill.pKnown,
      })) as Omit<Skill, SkillKey.NAME>[],
    );

    const lessonBestSkill = calculateLessonBestSkill(
      currentSkillLevels,
      resultSkillLevels,
      lesson.skills.map((s) => s.id),
    );

    const lessonAverageSpeed = calculateLessonAverageSpeed(
      lesson.content,
      timestamps,
    );

    await this._upsertFinished(lessonId, {
      userId,
      bestSkillId: lessonBestSkill,
      averageSpeed: lessonAverageSpeed,
    });

    const oldStatistics = await this._statisticsService.getByUserId(userId);

    const { averageSpeed, todayAverageSpeed } =
      await this._lessonRepository.getAverageSpeed(userId);

    const newStatistics = calculateStatistics({
      oldStatistics,
      timestamps,
      newStatistics: { averageSpeed, todayAverageSpeed },
      lessonAverageSpeed,
    });

    await this._statisticsService.updateByUserId(userId, newStatistics);

    const { priority, lessonId: lastStudyPlanLessonId } =
      await this._lessonRepository.getLastStudyPlanItemPriority(userId);

    if (
      isLastTestLesson ||
      (!isTestLesson && lastStudyPlanLessonId === lessonId)
    ) {
      const lastFinishedLessonIds =
        await this._lessonRepository.getLastNFinishedIds(userId, 5);

      const systemLessons =
        await this._lessonRepository.getSystemWithoutTestWithSkills();

      const updatedSkillLevels =
        await this._userService.getCurrentSkillLevels(userId);

      const nextStudyPlanLessonPayload = mapLessonsToNextStudyPlanLessonPayload(
        {
          lastFinishedLessons: lastFinishedLessonIds,
          systemLessons,
          skillLevels: updatedSkillLevels,
        },
      );

      const { lessonId } = await this._itsService.ahp(
        nextStudyPlanLessonPayload,
      );

      await this._lessonRepository.insertNewStudyPlanItem(
        userId,
        lessonId,
        priority + 1,
      );
    }
  }

  public async getRandomSystemIdWithoutTest(): Promise<RequiredLessonIdDto> {
    return this._lessonRepository.getRandomSystemIdWithoutTest();
  }
}

export { Lesson };
