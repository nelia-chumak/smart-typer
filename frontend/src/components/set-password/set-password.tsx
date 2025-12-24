import {
  AppRoute,
  FormFieldLabel,
  FormFieldType,
  SetPasswordKey,
} from 'common/enums/enums';
import { FC } from 'common/types/types';
import { FormField, Sign } from 'components/common/common';
import {
  useDispatch,
  useEffect,
  useForm,
  useNavigate,
  useSearchParams,
  useSelector,
} from 'hooks/hooks';
import { auth as authActions } from 'store/modules/actions';
import { setPasswordSchema } from 'validation-schemas/validation-schemas';
import { NewPassword } from './common/types/types';

const SetPassword: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSetPasswordLoading, user } = useSelector(({ auth, requests }) => ({
    user: auth.user,
    isSetPasswordLoading: requests.authSetPassword,
  }));
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPassword>(setPasswordSchema);

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  if (!token) {
    navigate(AppRoute.LOG_IN);
  }

  const handleSubmitForm = async (data: NewPassword): Promise<void> => {
    const { password } = data;
    void dispatch(authActions.setPassword({ password, token }));
  };

  useEffect(() => {
    if (!isSetPasswordLoading && user) {
      navigate(AppRoute.ROOT);
    }
  }, [isSetPasswordLoading, user]);

  return (
    <Sign
      header="Set your new password"
      description="Enter your new password."
      submitText="Save"
      onSubmit={handleSubmit(handleSubmitForm)}
      isSubmitDisabled={isSetPasswordLoading}
    >
      <FormField
        label={FormFieldLabel.PASSWORD}
        type={FormFieldType.PASSWORD}
        placeholder="Enter your new password"
        register={register(SetPasswordKey.PASSWORD)}
        error={errors.password}
      />
      <FormField
        label={FormFieldLabel.REPEAT_PASSWORD}
        type={FormFieldType.PASSWORD}
        placeholder="Repeat your new password"
        register={register(SetPasswordKey.PASSWORD_REPEAT)}
        error={errors.passwordRepeat}
      />
    </Sign>
  );
};

export { SetPassword };
