import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from 'common/constants/constants';
import {
  AppRoute,
  AvatarSize,
  CommonKey,
  ContentWrapperSize,
  FormFieldLabel,
  FormFieldType,
  SpinnerSize,
  UserKey,
  ValidationErrorMessage,
} from 'common/enums/enums';
import { FC, UserDto } from 'common/types/types';
import {
  Avatar,
  Button,
  ContentWrapper,
  FormField,
  Spinner,
} from 'components/common/common';
import { RBForm } from 'components/external/external';
import { bytesToMegabytes, clsx, replaceRouteIdParam } from 'helpers/helpers';
import {
  useDispatch,
  useEffect,
  useForm,
  useNavigate,
  useParams,
  useRef,
  useSelector,
  useState,
} from 'hooks/hooks';
import _ from 'lodash';
import { notification as notificationService } from 'services/services';
import { profile as profileActions } from 'store/modules/actions';
import { updateUserInfoSchema } from 'validation-schemas/validation-schemas';
import { CropAvatar, Rating, Statistics } from './components/components';

import styles from './styles.module.scss';

const Profile: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const {
    currentUserId,
    user,
    rating,
    statistics,
    isUserLoading,
    isPersonalInfoUpdateLoading,
    isAvatarUpdateLoading,
    isAvatarDeleteLoading,
  } = useSelector(({ auth, profile, requests }) => ({
    currentUserId: auth.user?.id,
    user: profile.user,
    statistics: profile.statistics,
    rating: profile.rating,
    isUserLoading: requests.profileLoadUser,
    isPersonalInfoUpdateLoading: requests.profileUpdatePersonalInfo,
    isAvatarUpdateLoading: requests.profileUpdateAvatar,
    isAvatarDeleteLoading: requests.profileDeleteAvatar,
  }));
  const isApplyLoading =
    isPersonalInfoUpdateLoading ||
    isAvatarUpdateLoading ||
    isAvatarDeleteLoading;
  const { id: userId } = useParams();
  const isCurrentUser = currentUserId === Number(userId);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCropModalVisible, setIsCropModalVisible] = useState(false);

  useEffect(() => {
    if (userId) {
      dispatch(profileActions.loadUser({ userId: Number(userId) }));
    }
  }, [userId]);

  const { watch, register, handleSubmit, formState, setValue } =
    useForm<Omit<UserDto, CommonKey.ID>>(updateUserInfoSchema);

  const fieldsValues = watch();
  const { errors } = formState;
  useEffect(() => {
    if (user) {
      const { email, nickname, photoUrl } = user;
      setValue(UserKey.PHOTO_URL as keyof UserDto, photoUrl);
      setValue(UserKey.NICKNAME as keyof UserDto, nickname);
      setValue(UserKey.EMAIL as keyof UserDto, email);
    }
  }, [user]);

  const handleDeleteAvatar = (): void => {
    setValue(UserKey.PHOTO_URL as keyof UserDto, null, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setSelectedFile(null);
  };

  const handleUploadAvatar = (): void => {
    inputRef.current?.click();
  };

  const handleApplyChanges = async (
    data: Omit<UserDto, CommonKey.ID>,
  ): Promise<void> => {
    const changes: Partial<Omit<UserDto, CommonKey.ID>> = _.omitBy(
      data,
      (value, key) => {
        return _.isEqual(value, (user as UserDto)[key as keyof UserDto]);
      },
    );
    if (changes.photoUrl && selectedFile) {
      dispatch(profileActions.updateAvatar(selectedFile));
      setSelectedFile(null);
    }
    if (_.isNull(changes.photoUrl)) {
      dispatch(profileActions.deleteAvatar());
    }
    if (changes.email || changes.nickname) {
      const personalInfo = _.omit(changes, UserKey.PHOTO_URL);
      dispatch(profileActions.updatePersonalInfo(personalInfo));
    }
  };

  const handleFileSelected = (
    fileSelectedEvent: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const [file] = fileSelectedEvent.target.files ?? [];
    if (file) {
      const { size, type } = file;
      const sizeInMegabytes = bytesToMegabytes(size);
      if (sizeInMegabytes > MAX_FILE_SIZE) {
        notificationService.error(ValidationErrorMessage.INVALID_FILE_SIZE);
        return;
      }
      if (!ALLOWED_FILE_TYPES.includes(type)) {
        notificationService.error(ValidationErrorMessage.FORBIDDEN_FILE_TYPE);
        return;
      }
      setSelectedFile(file);
      setIsCropModalVisible(true);
    }
  };

  const handleCropModalClose = (): void => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setIsCropModalVisible(false);
  };

  const handleUpdateAvatar = async (
    croppedFile: File,
    croppedFileUrl: string,
  ): Promise<void> => {
    setSelectedFile(croppedFile);
    setValue(UserKey.PHOTO_URL as keyof UserDto, croppedFileUrl, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setIsCropModalVisible(false);
  };

  const handleRatingRecordClick = (userId: UserDto[CommonKey.ID]): void => {
    navigate(replaceRouteIdParam(AppRoute.USERS_$ID_PROFILE, userId));
  };

  if (!userId) {
    navigate(AppRoute.ROOT);
  }

  if (isUserLoading) {
    return <Spinner size={SpinnerSize.LARGE} />;
  }

  if (!rating?.find((user) => user.id === Number(userId))) {
    navigate(AppRoute.ROOT);
  }

  return (
    <>
      <ContentWrapper
        size={ContentWrapperSize.MEDIUM}
        className={styles.profile}
      >
        <h1>
          Personal info
          {isCurrentUser && <span> — change your data</span>}
        </h1>
        <RBForm className={styles.form}>
          <div className={styles.avatarField}>
            <FormField
              label={FormFieldLabel.AVATAR}
              type={FormFieldType.FILE}
              register={{
                name: UserKey.PHOTO_URL,
                // @ts-ignore
                onChange: handleFileSelected,
              }}
              error={errors.photoUrl}
              note={
                <>
                  <span>* for best results use an image</span>
                  <br />
                  <span>at least 128px in .jpg format</span>
                </>
              }
              hidden
              inputRef={inputRef}
            />
            <Avatar
              name={fieldsValues[UserKey.NICKNAME]}
              src={fieldsValues[UserKey.PHOTO_URL]}
              size={AvatarSize.LARGE}
            />
            {isCurrentUser && (
              <>
                <Button
                  onClick={handleUploadAvatar}
                  isLoading={isAvatarUpdateLoading}
                  label="Upload"
                  className={clsx(styles.button, styles.uploadAvatarButton)}
                />
                {fieldsValues[UserKey.PHOTO_URL] && (
                  <Button
                    onClick={handleDeleteAvatar}
                    isLoading={isAvatarUpdateLoading}
                    label="Delete"
                    className={clsx(styles.button, styles.deleteAvatarButton)}
                  />
                )}
              </>
            )}
          </div>
          <div className={styles.personalInfoFields}>
            <FormField
              label={FormFieldLabel.NICKNAME}
              type={FormFieldType.TEXT}
              register={register(UserKey.NICKNAME)}
              error={errors.nickname}
              readOnly={!isCurrentUser}
            />
            <FormField
              label={FormFieldLabel.EMAIL}
              type={FormFieldType.TEXT}
              register={register(UserKey.EMAIL)}
              error={errors.email}
              readOnly={!isCurrentUser}
            />
          </div>
          <div className={styles.submitButtonContainer}>
            {isCurrentUser && (
              <Button
                onClick={handleSubmit(handleApplyChanges)}
                isLoading={isApplyLoading}
                label="Apply"
                className={clsx(styles.button, styles.submitButton)}
              />
            )}
          </div>
        </RBForm>
        <hr />
        <h1>
          Statistics
          {isCurrentUser && <span> — track your progress</span>}
        </h1>
        <Statistics statistics={statistics} />
        <hr />
        <h1>
          Rating
          {isCurrentUser && <span> — compete with like-minded</span>}
        </h1>
        <Rating rating={rating} onRecordClick={handleRatingRecordClick} />
      </ContentWrapper>
      <CropAvatar
        isVisible={isCropModalVisible}
        file={selectedFile}
        onClose={handleCropModalClose}
        onUpdateAvatar={handleUpdateAvatar}
      />
    </>
  );
};

export { Profile };
