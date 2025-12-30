import {
  AppRoute,
  FormFieldLabel,
  FormFieldType,
  UserKey,
} from 'common/enums/enums';
import { FC, RegisterRequestDto } from 'common/types/types';
import { FormField, Link, Sign } from 'components/common/common';
import {
  useDispatch,
  useSelector,
  useNavigate,
  useEffect,
  useForm,
} from 'hooks/hooks';
import { auth as authActions } from 'store/modules/actions';
import { signUpSchema } from 'validation-schemas/validation-schemas';

const SignUp: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authError, user, isSignUpLoading } = useSelector(
    ({ auth, requests }) => ({
      authError: auth.error,
      user: auth.user,
      isSignUpLoading: requests.authRegister,
    }),
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequestDto>(signUpSchema);

  useEffect(() => {
    if (user?.id) {
      navigate(AppRoute.ROOT);
    }
  }, [authError, user?.id]);

  const handleSubmitForm = (data: RegisterRequestDto): void => {
    void dispatch(authActions.register(data));
  };

  return (
    <Sign
      authError={authError}
      header="Get Started"
      description="Create new account to continue"
      submitText="Sign up"
      onSubmit={() => void handleSubmit(handleSubmitForm)}
      isSubmitDisabled={isSignUpLoading}
      alternativeRoute={{
        label: 'Already have an account?',
        linkText: 'Log in',
        path: AppRoute.LOG_IN,
      }}
    >
      <FormField
        label={FormFieldLabel.NICKNAME}
        type={FormFieldType.TEXT}
        placeholder="Enter your nickname"
        register={register(UserKey.NICKNAME)}
        error={errors.nickname}
      />
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

export { SignUp };
