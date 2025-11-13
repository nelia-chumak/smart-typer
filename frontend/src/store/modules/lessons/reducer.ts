import { CreatorType, ReducerName } from 'common/enums/enums';
import { LessonDto, LessonWithSkillsStatistics } from 'common/types/types';
import { createSlice, isAnyOf } from 'store/external/external';
import { lessons as lessonsActions } from './actions';

type State = {
  currentLesson: LessonWithSkillsStatistics | null;
  lessons: LessonDto[];
  allLessonsCount: number;
  studyPlan: LessonDto[];
  isLoadCurrentLessonFailed: boolean;
};

const initialState: State = {
  currentLesson: null,
  lessons: [],
  allLessonsCount: 0,
  studyPlan: [],
  isLoadCurrentLessonFailed: false,
};

const { reducer } = createSlice({
  name: ReducerName.LESSONS,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const {
      create,
      loadMoreLessons,
      loadLessons,
      addLesson,
      loadCurrent,
      resetAll,
      resetStudyPlan,
      loadStudyPlan,
      resetCurrent,
      addMisclick,
      addTimestamp,
      resetIsLoadCurrentLessonFailed,
      delete: deleteLesson,
    } = lessonsActions;
    builder
      .addCase(addLesson, (state, action) => {
        const newLessonIndex = state.lessons.filter(
          ({ creatorType }) => creatorType === CreatorType.CURRENT_USER,
        ).length;
        state.lessons = [
          ...state.lessons.slice(0, newLessonIndex),
          action.payload,
          ...state.lessons.slice(newLessonIndex),
        ];
      })
      .addCase(deleteLesson.fulfilled, (state, action) => {
        state.lessons = state.lessons.filter(
          ({ id }) => id !== action.payload.lessonId,
        );
      })
      .addCase(loadMoreLessons.fulfilled, (state, action) => {
        state.lessons = [...state.lessons, ...action.payload.data];
        state.allLessonsCount = action.payload.count;
      })
      .addCase(loadLessons.fulfilled, (state, action) => {
        state.lessons = action.payload.data;
        state.allLessonsCount = action.payload.count;
      })
      .addCase(resetAll, (state) => {
        Object.assign(state, initialState);
      })
      .addCase(loadStudyPlan.fulfilled, (state, action) => {
        state.studyPlan = action.payload;
      })
      .addCase(loadCurrent.rejected, (state) => {
        state.isLoadCurrentLessonFailed = true;
      })
      .addCase(resetIsLoadCurrentLessonFailed, (state) => {
        state.isLoadCurrentLessonFailed = false;
      })
      .addCase(resetCurrent, (state) => {
        state.currentLesson = null;
      })
      .addCase(resetStudyPlan, (state) => {
        state.studyPlan = [];
      })
      .addCase(addMisclick, (state, action) => {
        const index = action.payload;
        if (state.currentLesson) {
          const misclicks = [...state.currentLesson.misclicks];
          misclicks.splice(index, 1, true);
          state.currentLesson.misclicks = misclicks;
        }
      })
      .addCase(addTimestamp, (state, action) => {
        if (state.currentLesson) {
          state.currentLesson.timestamps = [
            ...state.currentLesson.timestamps,
            action.payload,
          ];
        }
      })
      .addMatcher(
        isAnyOf(create.fulfilled, loadCurrent.fulfilled),
        (state, action) => {
          state.currentLesson = action.payload;
          const misclicksLength = action.payload.content.length;
          state.currentLesson.misclicks = Array.from(
            { length: misclicksLength },
            () => false,
          );
        },
      );
  },
});

export { reducer };
