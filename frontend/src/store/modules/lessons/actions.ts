import {
  DEFAULT_LESSONS_OFFSET,
  LESSONS_AMOUNT_FOR_ONE_REQUEST,
} from 'common/constants/constants';
import {
  CommonKey,
  CreatorType,
  FinishedLessonKey,
  LessonKey,
  PaginationKey,
} from 'common/enums/enums';
import {
  IPaginationRequest,
  IPaginationResponse,
} from 'common/interfaces/interfaces';
import {
  CreateLessonRequestDto,
  LessonDto,
  LessonFilters,
  LessonIdDto,
  LessonWithSkillsStatistics,
} from 'common/types/types';
import { mapLessonToLessonWithSkillsStatistics } from 'helpers/helpers';
import { createAction, createAsyncThunk } from 'store/external/external';
import { ActionType } from './action-type';

class Lessons {
  public create = createAsyncThunk(
    ActionType.CREATE,
    async (
      payload: CreateLessonRequestDto,
      { extra: { services }, dispatch },
    ): Promise<LessonWithSkillsStatistics> => {
      const { lessonApi: lessonApiService } = services;
      const lesson = await lessonApiService.create(payload);
      dispatch(
        this.addLesson({
          ...payload,
          id: lesson.id,
          bestSkill: null,
          creatorType: CreatorType.CURRENT_USER,
        }),
      );
      return mapLessonToLessonWithSkillsStatistics(lesson);
    },
  );

  public delete = createAsyncThunk(
    ActionType.DELETE,
    async (
      payload: LessonIdDto,
      { extra: { services } },
    ): Promise<LessonIdDto> => {
      const { lessonApi: lessonApiService } = services;
      await lessonApiService.delete(payload);
      return payload;
    },
  );

  public addLesson = createAction(
    ActionType.ADD_LESSON,
    (
      payload: CreateLessonRequestDto &
        Pick<
          LessonDto,
          CommonKey.ID | FinishedLessonKey.BEST_SKILL | LessonKey.CREATOR_TYPE
        >,
    ) => ({
      payload,
    }),
  );

  public loadLessons = createAsyncThunk(
    ActionType.LOAD_LESSONS,
    async (
      payload: LessonFilters | undefined,
      { extra: { services } },
    ): Promise<IPaginationResponse<LessonDto>> => {
      const { lessonApi: lessonApiService } = services;

      const result = await lessonApiService.getMore({
        limit: LESSONS_AMOUNT_FOR_ONE_REQUEST,
        offset: DEFAULT_LESSONS_OFFSET,
        ...payload,
      });

      return result;
    },
  );

  public loadMoreLessons = createAsyncThunk(
    ActionType.LOAD_MORE_LESSONS,
    async (
      payload: Pick<IPaginationRequest, PaginationKey.OFFSET> & LessonFilters,
      { extra: { services } },
    ): Promise<IPaginationResponse<LessonDto>> => {
      const { lessonApi: lessonApiService } = services;

      const result = await lessonApiService.getMore({
        limit: LESSONS_AMOUNT_FOR_ONE_REQUEST,
        ...payload,
      });
      return result;
    },
  );

  public loadCurrent = createAsyncThunk(
    ActionType.LOAD_CURRENT,
    async (
      payload: LessonIdDto,
      { extra: { services } },
    ): Promise<LessonWithSkillsStatistics> => {
      const { lessonApi: lessonApiService } = services;
      const lesson = await lessonApiService.get(payload);
      return mapLessonToLessonWithSkillsStatistics(lesson);
    },
  );

  public loadStudyPlan = createAsyncThunk(
    ActionType.LOAD_STUDY_PLAN,
    async (_: undefined, { extra: { services } }): Promise<LessonDto[]> => {
      const { lessonApi: lessonApiService } = services;
      const studyPlan = await lessonApiService.getStudyPlan();
      return studyPlan;
    },
  );

  public resetAll = createAction(ActionType.RESET_ALL);

  public resetStudyPlan = createAction(ActionType.RESET_STUDY_PLAN);

  public resetCurrent = createAction(ActionType.RESET_CURRENT_LESSON);

  public addMisclick = createAction(
    ActionType.ADD_MISCLICK,
    (position: number) => ({ payload: position }),
  );

  public addTimestamp = createAction(
    ActionType.ADD_TIMESTAMP,
    (timestamp: number) => ({ payload: timestamp }),
  );

  public sendLessonResult = createAsyncThunk(
    ActionType.SEND_LESSON_RESULT,
    async (
      _: undefined,
      { getState, dispatch, extra: { services } },
    ): Promise<void> => {
      const { lessonApi: lessonApiService } = services;
      const {
        lessons: { currentLesson },
      } = getState();
      const { id, misclicks, timestamps } =
        currentLesson as LessonWithSkillsStatistics;
      await lessonApiService.sendLessonResult({
        lessonId: id,
        misclicks,
        timestamps,
      });
      dispatch(this.loadStudyPlan());
    },
  );

  public resetIsLoadCurrentLessonFailed = createAction(
    ActionType.RESET_IS_LOAD_CURRENT_LESSON_FAILED,
  );
}

const lessons = new Lessons();

export { lessons };
