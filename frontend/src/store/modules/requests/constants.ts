import {
  auth as authActions,
  profile as profileActions,
  racing as racingActions,
  settings as settingsActions,
  lessons as lessonsActions,
} from 'store/modules/actions';
import {
  AuthActionType,
  ProfileActionType,
  RacingActionType,
  SettingsActionType,
  LessonsActionType,
} from 'store/modules/action-type';
import { AsyncThunk, AsyncThunkOptions } from 'common/types/types';

const REQUEST_ACTIONS_TYPES = [
  AuthActionType.LOAD_CURRENT_USER,
  AuthActionType.LOG_IN,
  AuthActionType.REGISTER,
  AuthActionType.LOG_OUT,
  AuthActionType.LOG_IN_GOOGLE,
  AuthActionType.SET_PASSWORD,
  AuthActionType.RESET_PASSWORD,
  AuthActionType.LOAD_GOOGLE_URL,

  ProfileActionType.LOAD_USER,
  ProfileActionType.DELETE_AVATAR,
  ProfileActionType.UPDATE_AVATAR,
  ProfileActionType.UPDATE_PERSONAL_INFO,

  RacingActionType.LOAD_AVAILABLE_ROOMS,
  RacingActionType.CREATE_ROOM,
  RacingActionType.SEND_ROOM_URL_TO_EMAILS,
  RacingActionType.SET_CURRENT_ROOM,
  RacingActionType.LOAD_SHARE_ROOM_URL,
  RacingActionType.ADD_LESSON_ID,
  RacingActionType.REMOVE_LESSON_ID,

  SettingsActionType.UPDATE,

  LessonsActionType.CREATE,
  LessonsActionType.DELETE,
  LessonsActionType.LOAD_CURRENT,
  LessonsActionType.LOAD_MORE_LESSONS,
  LessonsActionType.LOAD_LESSONS,
  LessonsActionType.LOAD_STUDY_PLAN,
  LessonsActionType.SEND_LESSON_RESULT,
] as const;

const actions = {
  ...authActions,
  ...profileActions,
  ...racingActions,
  ...settingsActions,
  ...lessonsActions,
};

type AnyAsyncThunk = AsyncThunk<unknown, unknown, AsyncThunkOptions>;

const requestActions = Object.values(actions).filter((action) => {
  const type = (action as AnyAsyncThunk).typePrefix;
  const requestActionTypes = REQUEST_ACTIONS_TYPES.map((actionType) =>
    String(actionType),
  );
  return requestActionTypes.includes(type);
}) as AnyAsyncThunk[];

const STARTED_ACTIONS = requestActions.map((action) => action.pending);

const FINISHED_ACTIONS = [
  ...requestActions.map((action) => action.fulfilled),
  ...requestActions.map((action) => action.rejected),
];

export { STARTED_ACTIONS, FINISHED_ACTIONS, REQUEST_ACTIONS_TYPES };
