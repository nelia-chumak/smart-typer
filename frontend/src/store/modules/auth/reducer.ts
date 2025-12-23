import { ReducerName } from 'common/enums/enums';
import { UserDto } from 'common/types/types';
import { createSlice, isAnyOf } from 'store/external/external';
import { auth as authActions } from './actions';

type State = {
  user: UserDto | null;
  error: string | null;
  googleUrl: string | null;
};

const initialState: State = {
  user: null,
  error: null,
  googleUrl: null,
};

const { reducer } = createSlice({
  name: ReducerName.AUTH,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const {
      logIn,
      setError,
      register,
      logOut,
      logInGoogle,
      loadCurrentUser,
      updateUser,
      loadGoogleUrl,
      setPassword,
    } = authActions;
    builder
      .addCase(logOut.fulfilled, (state) => {
        Object.assign(state, initialState);
      })
      .addCase(setError, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateUser, (state, action) => {
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
      })
      .addCase(loadGoogleUrl.fulfilled, (state, action) => {
        if (action.payload) {
          state.googleUrl = action.payload;
        }
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
        }
      })
      .addMatcher(
        isAnyOf(
          logIn.fulfilled,
          register.fulfilled,
          logInGoogle.fulfilled,
          setPassword.fulfilled,
        ),
        (state, action) => {
          if (action.payload) {
            state.user = action.payload;
          }
        },
      );
  },
});

export { reducer };
