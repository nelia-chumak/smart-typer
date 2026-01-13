import { AppRoute, StorageKey } from 'common/enums/enums';
import { FC } from 'common/types/types';
import { ProtectedRoute, WithHeader } from 'components/common/common';
import {
  Home,
  Lesson,
  Lessons,
  LogIn,
  LogInGoogle,
  Profile,
  Racing,
  ResetPassword,
  Room,
  Rooms,
  SetPassword,
  Settings,
  SignUp,
  StudyPlan,
  Theory,
} from 'components/components';
import { RRDRoute, RRDRoutes } from 'components/external/external';
import {
  useDispatch,
  useEffect,
  useLocation,
  useShallowSelector,
} from 'hooks/hooks';
import { localStorage as localStorageService } from 'services/services';
import { auth as authActions } from 'store/modules/actions';

const App: FC = () => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { user, isUserRequestLoading } = useShallowSelector(
    ({ auth, requests }) => ({
      user: auth.user,
      isUserRequestLoading: requests.authLoadCurrentUser,
    }),
  );

  const token = localStorageService.getItem(StorageKey.ACCESS_TOKEN);

  const authRoutes = [
    AppRoute.LOG_IN,
    AppRoute.SIGN_UP,
    AppRoute.LOG_IN_GOOGLE,
  ] as string[];
  const isAuth = authRoutes.includes(pathname);
  const shouldFetchUser = !!token && !user && !isAuth;

  useEffect(() => {
    if (shouldFetchUser) {
      void dispatch(authActions.loadCurrentUser());
    }
  }, [shouldFetchUser]);

  const isUserLoading = shouldFetchUser || isUserRequestLoading;

  return (
    <RRDRoutes>
      <RRDRoute
        element={
          <ProtectedRoute hasUser={!!user} isUserLoading={isUserLoading} />
        }
      >
        <RRDRoute
          path={AppRoute.ROOT}
          element={
            <WithHeader>
              <Home />
            </WithHeader>
          }
        />
        <RRDRoute
          path={AppRoute.THEORY}
          element={
            <WithHeader>
              <Theory />
            </WithHeader>
          }
        />
        <RRDRoute
          path={AppRoute.LESSONS}
          element={
            <WithHeader>
              <Lessons />
            </WithHeader>
          }
        />
        <RRDRoute
          path={AppRoute.STUDY_PLAN}
          element={
            <WithHeader>
              <StudyPlan />
            </WithHeader>
          }
        />
        <RRDRoute
          path={AppRoute.RACING}
          element={
            <WithHeader>
              <Racing />
            </WithHeader>
          }
        />
        <RRDRoute
          path={AppRoute.USERS_$ID_PROFILE}
          element={
            <WithHeader>
              <Profile />
            </WithHeader>
          }
        />
        <RRDRoute
          path={AppRoute.SETTINGS}
          element={
            <WithHeader>
              <Settings />
            </WithHeader>
          }
        />
        <RRDRoute
          path={AppRoute.ROOMS}
          element={
            <WithHeader>
              <Rooms />
            </WithHeader>
          }
        />
        <RRDRoute
          path={AppRoute.ROOMS_$ID}
          element={
            <WithHeader>
              <Room />
            </WithHeader>
          }
        />
        <RRDRoute
          path={AppRoute.LESSON_$ID}
          element={
            <WithHeader>
              <Lesson />
            </WithHeader>
          }
        />
      </RRDRoute>
      <RRDRoute path={AppRoute.SIGN_UP} element={<SignUp />} />
      <RRDRoute path={AppRoute.LOG_IN_GOOGLE} element={<LogInGoogle />} />
      <RRDRoute path={AppRoute.LOG_IN} element={<LogIn />} />
      <RRDRoute path={AppRoute.RESET_PASSWORD} element={<ResetPassword />} />
      <RRDRoute path={AppRoute.SET_PASSWORD} element={<SetPassword />} />
    </RRDRoutes>
  );
};

export default App;
