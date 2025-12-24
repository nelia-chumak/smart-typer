import { AppRoute, FormFieldLabel, FormFieldType, UserKey } from 'common/enums/enums';
import { FC, LogInRequestDto } from 'common/types/types';
import { FormField, Link, Sign } from 'components/common/common';
import {
  useDispatch,
  useSelector,
  useNavigate,
  useEffect,
  useForm,
} from 'hooks/hooks';
import { auth as authActions } from 'store/modules/actions';
import { logInSchema } from 'validation-schemas/validation-schemas';

const LogIn: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authError, user, isLogInLoading } = useSelector(
    ({ auth, requests }) => ({
      authError: auth.error,
      user: auth.user,
      isLogInLoading: requests.authLogIn,
    }),
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LogInRequestDto>(logInSchema);

  useEffect(() => {
    if (user?.id) {
      navigate(AppRoute.ROOT);
    }
  }, [authError, user?.id]);

  const handleSubmitForm = (data: LogInRequestDto): void => {
    void dispatch(authActions.logIn(data));
  };

  return (
    <Sign
      authError={authError}
      header="Welcome back"
      description="Log in to your account to continue"
      submitText="Log in"
      onSubmit={handleSubmit(handleSubmitForm)}
      isSubmitDisabled={isLogInLoading}
      alternativeRoute={{
        label: 'Don\'t have an account?',
        linkText: 'Sign up',
        path: AppRoute.SIGN_UP,
      }}
    >
      <FormField
        label={FormFieldLabel.EMAIL}
        type={FormFieldType.EMAIL}
        placeholder="Enter your email"
        register={register(UserKey.EMAIL)}
        error={errors.email}
      />
      <FormField
        label={FormFieldLabel.PASSWORD}
        type={FormFieldType.PASSWORD}
        register={register(UserKey.PASSWORD)}
        placeholder="Enter your password"
        error={errors.password}
        note={
          <Link to={AppRoute.RESET_PASSWORD}>
            <span>Forgot password?</span>
          </Link>
        }
      />
    </Sign>
  );
};

export { LogIn };
