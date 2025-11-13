import {
  RANDOM_LESSON_COUNT,
  TEST_LESSON_NAMES,
} from 'common/constants/constants';
import {
  CommonKey,
  CreatorType,
  LessonKey,
  LessonRelationMappings,
  LessonToSkillKey,
  LessonToSkillRelationMapping,
  RecordsSortOrder,
  RoomKey,
  SkillKey,
  StatisticsKey,
  TableName,
  UserToFinishedLessonKey,
  UserToFinishedLessonRelationMapping,
  UserToStudyPlanLessonKey,
} from 'common/enums/enums';
import {
  ILessonRecord,
  IPaginationRequest,
  IPaginationResponse,
  IUserToStudyPlanLessonRecord,
} from 'common/interfaces/interfaces';
import {
  CreateLessonRequestDto,
  FinishedLesson,
  LessonDto,
  LessonFilters,
  LessonResponseDto,
  LessonWithSkills,
  LessonWithSkillsAndContentType,
  RequiredLessonIdDto,
  Statistics,
  UserDto,
} from 'common/types/types';
import { Lesson as LessonModel } from 'data/models/models';
import { defineCreatorType } from 'helpers/helpers';

type Constructor = {
  LessonModel: typeof LessonModel;
};

class Lesson {
  private _LessonModel: typeof LessonModel;

  public constructor(params: Constructor) {
    this._LessonModel = params.LessonModel;
  }

  private static DEFAULT_LESSON_COLUMNS_TO_RETURN: string[] = [
    `${TableName.LESSONS}.${CommonKey.ID}`,
    `${TableName.LESSONS}.${LessonKey.CONTENT}`,
    `${TableName.LESSONS}.${LessonKey.NAME}`,
  ];

  public async getById(
    lessonId: LessonDto[CommonKey.ID],
  ): Promise<LessonResponseDto | undefined> {
    return this._LessonModel
      .query()
      .select(...Lesson.DEFAULT_LESSON_COLUMNS_TO_RETURN)
      .findOne({ [CommonKey.ID]: lessonId })
      .execute();
  }

  public async getFinishedByIdAndUserId(
    lessonId: LessonDto[CommonKey.ID],
    userId: UserDto[CommonKey.ID],
  ): Promise<LessonResponseDto | undefined> {
    return this._LessonModel
      .query()
      .select(`${LessonRelationMappings.FINISHED_LESSON}.*`)
      .innerJoinRelated(LessonRelationMappings.FINISHED_LESSON)
      .findOne({
        [UserToFinishedLessonKey.LESSON_ID]: lessonId,
        [UserToFinishedLessonKey.USER_ID]: userId,
      });
  }

  public async deleteByIdAndOwnerId(
    userId: UserDto[CommonKey.ID],
    lessonId: LessonDto[CommonKey.ID],
  ): Promise<Pick<LessonDto, CommonKey.ID> | undefined> {
    return this._LessonModel
      .query()
      .deleteById(lessonId)
      .where(LessonKey.CREATOR_ID, userId)
      .returning([CommonKey.ID])
      .castTo<Pick<LessonDto, CommonKey.ID> | undefined>();
  }

  public async getByIdWithSkills(
    lessonId: LessonDto[CommonKey.ID],
  ): Promise<LessonWithSkills | undefined> {
    const { lessonToSkills, ...lesson } =
      (await this._LessonModel
        .query()
        .select(...Lesson.DEFAULT_LESSON_COLUMNS_TO_RETURN)
        .findOne({ [`${TableName.LESSONS}.${CommonKey.ID}`]: lessonId })
        .withGraphJoined(
          `[${LessonRelationMappings.LESSON_TO_SKILLS}.[${LessonToSkillRelationMapping.SKILL}]]`,
        )
        .modifyGraph(LessonRelationMappings.LESSON_TO_SKILLS, (builder) =>
          builder.select(LessonToSkillKey.COUNT),
        )
        .modifyGraph(
          `${LessonRelationMappings.LESSON_TO_SKILLS}.[${LessonToSkillRelationMapping.SKILL}]`,
          (builder) => builder.select(CommonKey.ID, SkillKey.NAME),
        )
        .castTo<any>()) ?? {};

    if (!lessonToSkills) {
      return;
    }

    const mappedSkills = lessonToSkills.map(({ count, skill }: any) => ({
      count,
      ...skill,
    }));

    return {
      ...lesson,
      skills: mappedSkills,
    };
  }

  public async create(
    userId: UserDto[CommonKey.ID],
    data: CreateLessonRequestDto,
  ): Promise<LessonResponseDto> {
    const { id, name, content } = await this._LessonModel
      .query()
      .insert({
        ...data,
        creatorId: userId,
      })
      .returning(Lesson.DEFAULT_LESSON_COLUMNS_TO_RETURN);

    const lesson = {
      id,
      name,
      content,
    };

    const contentReplaced = data.content.replace(/'/g, '"');

    await this._LessonModel.knex().raw(`
      WITH skill_count AS (
        SELECT ${lesson.id} AS lesson_id, skills.id AS skill_id, COUNT(matches)
        FROM skills,
        LATERAL regexp_matches('${contentReplaced}', skills.name, 'gi') AS matches
        GROUP BY skills.id
      )
      INSERT INTO lessons_to_skills (lesson_id, skill_id, count)
      SELECT * FROM skill_count
      WHERE count > 0;
    `);

    return lesson;
  }

  public async getPaginated(
    userId: UserDto[CommonKey.ID],
    data: IPaginationRequest & LessonFilters,
  ): Promise<IPaginationResponse<LessonDto>> {
    const { offset, limit, contentType, creatorType } = data;
    const lessons = await this._LessonModel
      .query()
      .select(
        ...Lesson.DEFAULT_LESSON_COLUMNS_TO_RETURN,
        LessonKey.CREATOR_ID,
        LessonKey.CONTENT_TYPE,
      )
      .where((builder) => {
        if (contentType) {
          builder.where({ contentType });
        }
      })
      .andWhere((builder) => {
        if (creatorType === CreatorType.SYSTEM) {
          builder.whereNull(LessonKey.CREATOR_ID);
        } else if (creatorType === CreatorType.OTHER_USERS) {
          builder.whereNot({ [LessonKey.CREATOR_ID]: userId });
        } else if (creatorType === CreatorType.CURRENT_USER) {
          builder.where({ [LessonKey.CREATOR_ID]: userId });
        }
      })
      .withGraphJoined(
        `[${LessonRelationMappings.FINISHED_LESSON}.[${UserToFinishedLessonRelationMapping.SKILL}]]`,
      )
      .modifyGraph(LessonRelationMappings.FINISHED_LESSON, (builder) =>
        builder.findOne({ userId }),
      )
      .modifyGraph(
        `${LessonRelationMappings.FINISHED_LESSON}.[${UserToFinishedLessonRelationMapping.SKILL}]`,
        (builder) => builder.select(SkillKey.NAME),
      )
      .orderByRaw(`CASE WHEN creator_id = ${userId} THEN 0 ELSE 1 END`)
      .orderBy(
        `${TableName.LESSONS}.${CommonKey.CREATED_AT}`,
        RecordsSortOrder.ASC,
      )
      .offset(offset)
      .limit(limit)
      .castTo<any[]>();

    const mappedLessons = lessons.map(
      ({ creatorId, finishedLesson, ...lesson }) => {
        return {
          ...lesson,
          creatorType: defineCreatorType({ userId, creatorId }),
          bestSkill: finishedLesson?.pop()?.skill?.name ?? null,
        };
      },
    );

    const count = await this._LessonModel
      .query()
      .where((builder) => {
        if (contentType) {
          builder.where({ contentType });
        }
      })
      .andWhere((builder) => {
        if (creatorType === CreatorType.SYSTEM) {
          builder.whereNull(LessonKey.CREATOR_ID);
        } else if (creatorType === CreatorType.OTHER_USERS) {
          builder.whereNot({ [LessonKey.CREATOR_ID]: userId });
        } else if (creatorType === CreatorType.CURRENT_USER) {
          builder.where({ [LessonKey.CREATOR_ID]: userId });
        }
      })
      .resultSize();

    return {
      data: mappedLessons,
      count,
    };
  }

  public getTestIds(): Promise<
    Pick<IUserToStudyPlanLessonRecord, UserToStudyPlanLessonKey.LESSON_ID>[]
  > {
    return this._LessonModel
      .query()
      .select(`${CommonKey.ID} as ${UserToStudyPlanLessonKey.LESSON_ID}`)
      .whereIn(LessonKey.NAME, TEST_LESSON_NAMES)
      .castTo<
        Pick<IUserToStudyPlanLessonRecord, UserToStudyPlanLessonKey.LESSON_ID>[]
      >()
      .execute();
  }

  public async getStudyPlanByUserId(
    userId: UserDto[CommonKey.ID],
    areTestLessons = false,
  ): Promise<LessonDto[]> {
    const lessons = await this._LessonModel
      .query()
      .select(
        ...Lesson.DEFAULT_LESSON_COLUMNS_TO_RETURN,
        `${TableName.LESSONS}.${LessonKey.CONTENT_TYPE}`,
        `${TableName.LESSONS}.${LessonKey.CREATOR_ID}`,
      )
      .joinRelated(LessonRelationMappings.STUDY_PLAN)
      .where((builder) => {
        if (areTestLessons) {
          builder.whereIn(
            `${TableName.LESSONS}.${LessonKey.NAME}`,
            TEST_LESSON_NAMES,
          );
        } else {
          builder.whereNotIn(
            `${TableName.LESSONS}.${LessonKey.NAME}`,
            TEST_LESSON_NAMES,
          );
        }
      })
      .andWhere({
        [`${LessonRelationMappings.STUDY_PLAN}.${UserToStudyPlanLessonKey.USER_ID}`]:
          userId,
      })
      .withGraphJoined(
        `[ ${LessonRelationMappings.FINISHED_LESSON}.[${UserToFinishedLessonRelationMapping.SKILL}]]`,
      )
      .modifyGraph(
        `${LessonRelationMappings.FINISHED_LESSON}.[${UserToFinishedLessonRelationMapping.SKILL}]`,
        (builder) => builder.select(SkillKey.NAME),
      )
      .orderBy(
        `${LessonRelationMappings.STUDY_PLAN}.${UserToStudyPlanLessonKey.PRIORITY}`,
        RecordsSortOrder.ASC,
      )
      .orderBy(
        `${LessonRelationMappings.STUDY_PLAN}.${UserToStudyPlanLessonKey.LESSON_ID}`,
        RecordsSortOrder.ASC,
      )
      .castTo<any[]>();

    const mappedLessons = lessons.map(
      ({ studyPlan: _studyPlan, creatorId, finishedLesson, ...lesson }) => {
        return {
          ...lesson,
          creatorType: defineCreatorType({ userId, creatorId }),
          bestSkill: finishedLesson?.pop()?.skill?.name ?? null,
        };
      },
    );

    return mappedLessons;
  }

  public async getAverageSpeed(
    userId: UserDto[CommonKey.ID],
  ): Promise<
    Pick<
      Statistics,
      StatisticsKey.AVERAGE_SPEED | StatisticsKey.TODAY_AVERAGE_SPEED
    >
  > {
    const today = new Date().toISOString().split('T')[0];

    return this._LessonModel
      .query()
      .select(
        this._LessonModel
          .query()
          .innerJoinRelated(LessonRelationMappings.FINISHED_LESSON)
          .where({
            [`${LessonRelationMappings.FINISHED_LESSON}.${UserToFinishedLessonKey.USER_ID}`]:
              userId,
          })
          .avg(UserToFinishedLessonKey.AVERAGE_SPEED)
          .as('averageSpeed'),

        this._LessonModel
          .query()
          .innerJoinRelated(LessonRelationMappings.FINISHED_LESSON)
          .where({
            [`${LessonRelationMappings.FINISHED_LESSON}.${UserToFinishedLessonKey.USER_ID}`]:
              userId,
          })
          .andWhere(
            this._LessonModel.raw('??::date', [
              `${LessonRelationMappings.FINISHED_LESSON}.${CommonKey.UPDATED_AT}`,
            ]),
            '=',
            today,
          )
          .avg(`${UserToFinishedLessonKey.AVERAGE_SPEED}`)
          .as('todayAverageSpeed'),
      )
      .first()
      .castTo<
        Pick<
          Statistics,
          StatisticsKey.AVERAGE_SPEED | StatisticsKey.TODAY_AVERAGE_SPEED
        >
      >();
  }

  public insertNewStudyPlanItem(
    userId: UserDto[CommonKey.ID],
    lessonId: LessonDto[CommonKey.ID],
    priority: number,
  ): Promise<ILessonRecord> {
    return this._LessonModel
      .relatedQuery(LessonRelationMappings.STUDY_PLAN)
      .for(lessonId)
      .insert({ userId, priority })
      .castTo<ILessonRecord>()
      .execute();
  }

  public getLastStudyPlanItemPriority(
    userId: UserDto[CommonKey.ID],
  ): Promise<
    Pick<
      IUserToStudyPlanLessonRecord,
      UserToStudyPlanLessonKey.PRIORITY | UserToStudyPlanLessonKey.LESSON_ID
    >
  > {
    return this._LessonModel
      .query()
      .select(
        `${LessonRelationMappings.STUDY_PLAN}.${UserToStudyPlanLessonKey.PRIORITY}`,
        `${LessonRelationMappings.STUDY_PLAN}.${UserToStudyPlanLessonKey.LESSON_ID}`,
      )
      .innerJoinRelated(LessonRelationMappings.STUDY_PLAN)
      .orderBy(
        `${LessonRelationMappings.STUDY_PLAN}.${UserToStudyPlanLessonKey.PRIORITY}`,
        RecordsSortOrder.DESC,
      )
      .findOne({ userId })
      .castTo<
        Pick<
          IUserToStudyPlanLessonRecord,
          UserToStudyPlanLessonKey.PRIORITY | UserToStudyPlanLessonKey.LESSON_ID
        >
      >()
      .execute();
  }

  public insertFinished(
    lessonId: LessonDto[CommonKey.ID],
    data: FinishedLesson,
  ): Promise<ILessonRecord> {
    return this._LessonModel
      .relatedQuery(LessonRelationMappings.FINISHED_LESSON)
      .for(lessonId)
      .insert(data)
      .castTo<ILessonRecord>()
      .execute();
  }

  public updateFinished(
    lessonId: LessonDto[CommonKey.ID],
    data: FinishedLesson,
  ): Promise<ILessonRecord> {
    return this._LessonModel
      .relatedQuery(LessonRelationMappings.FINISHED_LESSON)
      .for(lessonId)
      .update(data)
      .castTo<ILessonRecord>()
      .execute();
  }

  public async getSystemWithoutTestWithSkills(): Promise<
    LessonWithSkillsAndContentType[]
  > {
    const lessons = await this._LessonModel
      .query()
      .select(
        ...Lesson.DEFAULT_LESSON_COLUMNS_TO_RETURN,
        `${TableName.LESSONS}.${LessonKey.CONTENT_TYPE}`,
      )
      .whereNull(LessonKey.CREATOR_ID)
      .whereNotIn(`${TableName.LESSONS}.${LessonKey.NAME}`, TEST_LESSON_NAMES)
      .withGraphJoined(
        `[${LessonRelationMappings.LESSON_TO_SKILLS}.[${LessonToSkillRelationMapping.SKILL}]]`,
      )
      .modifyGraph(LessonRelationMappings.LESSON_TO_SKILLS, (builder) =>
        builder.select(LessonToSkillKey.COUNT),
      )
      .modifyGraph(
        `${LessonRelationMappings.LESSON_TO_SKILLS}.[${LessonToSkillRelationMapping.SKILL}]`,
        (builder) => builder.select(CommonKey.ID, SkillKey.NAME),
      );

    const mappedLessons = lessons.map(({ lessonToSkills, ...lesson }: any) => {
      const mappedSkills = lessonToSkills.map(({ count, skill }: any) => ({
        count,
        ...skill,
      }));
      return {
        ...lesson,
        skills: mappedSkills,
      };
    });
    return mappedLessons;
  }

  public async getLastNFinishedIds(
    userId: UserDto[CommonKey.ID],
    n: number,
  ): Promise<Pick<LessonDto, CommonKey.ID>[]> {
    return this._LessonModel
      .query()
      .select(`${TableName.LESSONS}.${CommonKey.ID}`)
      .where({
        [`${LessonRelationMappings.FINISHED_LESSON}.${UserToFinishedLessonKey.USER_ID}`]:
          userId,
      })
      .innerJoinRelated(LessonRelationMappings.FINISHED_LESSON)
      .orderBy(
        `${LessonRelationMappings.FINISHED_LESSON}.${CommonKey.CREATED_AT}`,
        RecordsSortOrder.DESC,
      )
      .limit(n);
  }

  public async getRandomSystemIdWithoutTest(): Promise<RequiredLessonIdDto> {
    return this._LessonModel
      .query()
      .select(`${CommonKey.ID} as ${RoomKey.LESSON_ID}`)
      .whereNull(LessonKey.CREATOR_ID)
      .whereNotIn(LessonKey.NAME, TEST_LESSON_NAMES)
      .orderByRaw('random()')
      .limit(RANDOM_LESSON_COUNT)
      .first()
      .castTo<RequiredLessonIdDto>();
  }
}
export { Lesson };
