import {
  RANDOM_LESSON_COUNT,
  TEST_LESSON_NAMES,
} from 'common/constants/constants';
import {
  CommonKey,
  CreatorType,
  FinishedLessonKey,
  LessonKey,
  LessonRelationMappings,
  LessonToSkillKey,
  LessonToSkillRelationMapping,
  LessonViewKey,
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
  Skill,
  Statistics,
  Transaction,
  UserDto,
} from 'common/types/types';
import {
  Lesson as LessonModel,
  UserToFinishedLesson as UserToFinishedLessonModel,
} from 'data/models/models';
import { transaction } from 'dependencies/dependencies';
import { defineCreatorType, toSnakeCase } from 'helpers/helpers';

type Constructor = {
  LessonModel: typeof LessonModel;
  UserToFinishedLessonModel: typeof UserToFinishedLessonModel;
};

class Lesson {
  private _LessonModel: typeof LessonModel;
  private _UserToFinishedLessonModel: typeof UserToFinishedLessonModel;

  public constructor(params: Constructor) {
    this._LessonModel = params.LessonModel;
    this._UserToFinishedLessonModel = params.UserToFinishedLessonModel;
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
      .findOne({ [CommonKey.ID]: lessonId });
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
    const queryResult = await this._LessonModel
      .query()
      .select(...Lesson.DEFAULT_LESSON_COLUMNS_TO_RETURN)
      .findOne({ [`${TableName.LESSONS}.${CommonKey.ID}`]: lessonId })
      .withGraphJoined(
        `[${LessonRelationMappings.LESSON_TO_SKILLS}.[${LessonToSkillRelationMapping.SKILL}]]`,
      )
      .modifyGraph(LessonRelationMappings.LESSON_TO_SKILLS, (builder) => {
        builder.select(LessonToSkillKey.COUNT);
      })
      .modifyGraph(
        `${LessonRelationMappings.LESSON_TO_SKILLS}.[${LessonToSkillRelationMapping.SKILL}]`,
        (builder) => {
          builder.select(CommonKey.ID, SkillKey.NAME);
        },
      )
      .castTo<
        LessonResponseDto & {
          lessonToSkills: Array<{
            count: number;
            skill: Pick<Skill, CommonKey.ID | SkillKey.NAME>;
          }>;
        }
      >();

    if (!queryResult?.lessonToSkills) {
      return;
    }

    const { lessonToSkills, ...rest } = queryResult;

    return {
      ...rest,
      skills: lessonToSkills.map(({ count, skill }) => ({
        count,
        ...skill,
      })),
    };
  }

  public async create(
    userId: UserDto[CommonKey.ID],
    data: CreateLessonRequestDto,
  ): Promise<LessonResponseDto> {
    return await transaction(this._LessonModel.knex(), async (trx) => {
      const { id, name, content } = await this._LessonModel
        .query(trx)
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

      await trx.raw(
        `
        INSERT INTO lessons_to_skills (lesson_id, skill_id, count)
        SELECT
          ?                  AS lesson_id,
          skills.id          AS skill_id,
          COUNT(*)::int      AS count
        FROM skills
        CROSS JOIN LATERAL regexp_matches(?, skills.name, 'gi') AS match_text
        GROUP BY skills.id
        `,
        [lesson.id, content],
      );

      return lesson;
    });
  }

  public async getPaginated(
    userId: UserDto[CommonKey.ID],
    data: IPaginationRequest & LessonFilters,
  ): Promise<IPaginationResponse<LessonDto>> {
    const { offset, limit, contentType, creatorType } = data;

    const baseQuery = this._LessonModel.query().modify((builder) => {
      if (contentType) {
        builder.where({ contentType });
      }

      if (creatorType === CreatorType.SYSTEM) {
        builder.whereNull(LessonKey.CREATOR_ID);
      } else if (creatorType === CreatorType.OTHER_USERS) {
        builder.whereNot({ [LessonKey.CREATOR_ID]: userId });
      } else if (creatorType === CreatorType.CURRENT_USER) {
        builder.where({ [LessonKey.CREATOR_ID]: userId });
      }
    });

    const bestSkillQuery = this._UserToFinishedLessonModel
      .query()
      .select(`${UserToFinishedLessonRelationMapping.SKILL}.${SkillKey.NAME}`)
      .joinRelated(UserToFinishedLessonRelationMapping.SKILL)
      .where(
        `${TableName.USERS_TO_FINISHED_LESSONS}.${UserToFinishedLessonKey.USER_ID}`,
        userId,
      )
      .where(
        `${TableName.USERS_TO_FINISHED_LESSONS}.${UserToFinishedLessonKey.LESSON_ID}`,
        this._LessonModel.knex().ref(`${TableName.LESSONS}.${CommonKey.ID}`),
      )
      .orderBy(
        `${TableName.USERS_TO_FINISHED_LESSONS}.${CommonKey.CREATED_AT}`,
        RecordsSortOrder.DESC,
      )
      .limit(1)
      .as('bestSkill');

    const lessonsQueryResult = await baseQuery
      .clone()
      .select(
        ...Lesson.DEFAULT_LESSON_COLUMNS_TO_RETURN,
        LessonKey.CREATOR_ID,
        LessonKey.CONTENT_TYPE,
        bestSkillQuery,
      )
      .orderByRaw(
        `CASE WHEN ${toSnakeCase(LessonKey.CREATOR_ID)} = ? THEN 0 ELSE 1 END`,
        [userId],
      )
      .orderBy(
        `${TableName.LESSONS}.${CommonKey.CREATED_AT}`,
        RecordsSortOrder.ASC,
      )
      .offset(offset)
      .limit(limit)
      .castTo<
        (Omit<LessonDto, LessonViewKey.CREATOR_TYPE> & {
          creatorId: ILessonRecord[LessonKey.CREATOR_ID];
        })[]
      >();

    const mappedLessons = lessonsQueryResult.map(
      ({ creatorId, ...lesson }) => ({
        ...lesson,
        creatorType: defineCreatorType({ userId, creatorId }),
      }),
    );

    const countQueryResult = await baseQuery.clone().resultSize();

    return { data: mappedLessons, count: countQueryResult };
  }

  public getTestIds(
    trx?: Transaction,
  ): Promise<
    Pick<IUserToStudyPlanLessonRecord, UserToStudyPlanLessonKey.LESSON_ID>[]
  > {
    return this._LessonModel
      .query(trx)
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
    const bestSkillQuery = this._UserToFinishedLessonModel
      .query()
      .select(`${UserToFinishedLessonRelationMapping.SKILL}.${SkillKey.NAME}`)
      .joinRelated(UserToFinishedLessonRelationMapping.SKILL)
      .where(
        `${TableName.USERS_TO_FINISHED_LESSONS}.${UserToFinishedLessonKey.USER_ID}`,
        userId,
      )
      .where(
        `${TableName.USERS_TO_FINISHED_LESSONS}.${UserToFinishedLessonKey.LESSON_ID}`,
        this._LessonModel.knex().ref(`${TableName.LESSONS}.${CommonKey.ID}`),
      )
      .orderBy(
        `${TableName.USERS_TO_FINISHED_LESSONS}.${CommonKey.CREATED_AT}`,
        RecordsSortOrder.DESC,
      )
      .limit(1)
      .as('bestSkill');

    const queryResult = await this._LessonModel
      .query()
      .select(
        ...Lesson.DEFAULT_LESSON_COLUMNS_TO_RETURN,
        `${TableName.LESSONS}.${LessonKey.CONTENT_TYPE}`,
        `${TableName.LESSONS}.${LessonKey.CREATOR_ID}`,
        bestSkillQuery,
      )
      .joinRelated(LessonRelationMappings.STUDY_PLAN)
      .where(
        `${TableName.LESSONS}.${LessonKey.NAME}`,
        areTestLessons ? 'in' : 'not in',
        TEST_LESSON_NAMES,
      )
      .andWhere({
        [`${LessonRelationMappings.STUDY_PLAN}.${UserToStudyPlanLessonKey.USER_ID}`]:
          userId,
      })
      .orderBy(
        `${LessonRelationMappings.STUDY_PLAN}.${UserToStudyPlanLessonKey.PRIORITY}`,
        RecordsSortOrder.ASC,
      )
      .orderBy(
        `${LessonRelationMappings.STUDY_PLAN}.${UserToStudyPlanLessonKey.LESSON_ID}`,
        RecordsSortOrder.ASC,
      )
      .castTo<
        (Omit<LessonDto, LessonViewKey.CREATOR_TYPE> & {
          creatorId: ILessonRecord[LessonKey.CREATOR_ID];
        })[]
      >();

    const mappedLessons = queryResult.map(({ creatorId, ...lesson }) => {
      return {
        ...lesson,
        creatorType: defineCreatorType({ userId, creatorId }),
      };
    });

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
      .modifyGraph(LessonRelationMappings.LESSON_TO_SKILLS, (builder) => {
        builder.select(LessonToSkillKey.COUNT);
      })
      .modifyGraph(
        `${LessonRelationMappings.LESSON_TO_SKILLS}.[${LessonToSkillRelationMapping.SKILL}]`,
        (builder) => {
          builder.select(CommonKey.ID, SkillKey.NAME);
        },
      )
      .castTo<
        (Omit<
          LessonDto,
          LessonViewKey.CREATOR_TYPE | FinishedLessonKey.BEST_SKILL
        > & {
          contentType: LessonDto[LessonKey.CONTENT_TYPE];
          lessonToSkills: Array<{
            count: number;
            skill: Pick<Skill, CommonKey.ID | SkillKey.NAME>;
          }>;
        })[]
      >();

    const mappedLessons = lessons.map(({ lessonToSkills, ...lesson }) => {
      const mappedSkills = lessonToSkills.map(({ count, skill }) => ({
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
