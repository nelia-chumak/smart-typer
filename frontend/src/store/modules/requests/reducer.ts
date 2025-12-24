import { ReducerName } from 'common/enums/enums';
import { createSlice, isAnyOf } from 'store/external/external';
import {
  FINISHED_ACTIONS,
  REQUEST_ACTIONS_TYPES,
  STARTED_ACTIONS,
} from './constants';

type RequestActionType = (typeof REQUEST_ACTIONS_TYPES)[number];

const initialState = {} as Record<RequestActionType, boolean>;
for (const requestActionType of REQUEST_ACTIONS_TYPES) {
  initialState[requestActionType] = false;
}

const { reducer } = createSlice({
  name: ReducerName.REQUESTS,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(isAnyOf(...STARTED_ACTIONS), (state, action) => {
        state[action.type.split('/').shift() as RequestActionType] = true;
      })
      .addMatcher(isAnyOf(...FINISHED_ACTIONS), (state, action) => {
        state[action.type.split('/').shift() as RequestActionType] = false;
      });
  },
});

export { reducer };
