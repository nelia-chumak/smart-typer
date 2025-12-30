import {
  CardHeaderColor,
  ContentWrapperSize,
  FormFieldLabel,
  FormFieldType,
  SettingsKey,
} from 'common/enums/enums';
import { FC, SettingsDto } from 'common/types/types';
import {
  Button,
  Card,
  ContentWrapper,
  FormField,
} from 'components/common/common';
import { RBForm } from 'components/external/external';
import { clsx } from 'helpers/helpers';
import { useDispatch, useForm, useSelector } from 'hooks/hooks';
import { settings as settingsActions } from 'store/modules/actions';
import { updateSettingsSchema } from 'validation-schemas/validation-schemas';

import styles from './styles.module.scss';

const Settings: FC = () => {
  const dispatch = useDispatch();
  const {
    gameTime,
    countdownBeforeGame,
    hasEmailNotifications,
    isShownInRating,
    isSoundTurnedOn,
    isUpdateLoading,
  } = useSelector(({ settings, requests }) => ({
    gameTime: settings.gameTime,
    countdownBeforeGame: settings.countdownBeforeGame,
    hasEmailNotifications: settings.hasEmailNotifications,
    isShownInRating: settings.isShownInRating,
    isSoundTurnedOn: settings.isShownInRating,
    isUpdateLoading: requests.settingsUpdate,
  }));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsDto>(updateSettingsSchema, {
    gameTime,
    countdownBeforeGame,
    hasEmailNotifications,
    isShownInRating,
    isSoundTurnedOn,
  });

  const handleSubmitForm = (data: SettingsDto): void => {
    void dispatch(settingsActions.update(data));
  };

  return (
    <ContentWrapper
      size={ContentWrapperSize.MEDIUM}
      className={styles.settings}
    >
      <h1>
        Settings
        <span> — customize your experience</span>
      </h1>
      <RBForm className={styles.form}>
        <div className={styles.cards}>
          <Card
            title="Racing"
            color={CardHeaderColor.BLUE}
            className={clsx(styles.racingCard, styles.card)}
            childrenContainerClassName={styles.racingCardFieldsContainer}
          >
            <FormField
              label={FormFieldLabel.GAME_TIME}
              type={FormFieldType.NUMBER}
              register={register(SettingsKey.GAME_TIME)}
              error={errors.gameTime}
              inputClassName={styles.racingField}
              note={<span>* only for the single player mode</span>}
            />
            <hr />
            <FormField
              label={FormFieldLabel.COUNTDOWN_BEFORE_GAME}
              type={FormFieldType.NUMBER}
              register={register(SettingsKey.COUNTDOWN_BEFORE_GAME)}
              error={errors.countdownBeforeGame}
              inputClassName={styles.racingField}
              note={<span>* only for the single player mode</span>}
            />
          </Card>
          <div>
            <Card
              title="Notifications"
              color={CardHeaderColor.YELLOW}
              className={styles.card}
            >
              <FormField
                label={FormFieldLabel.HAS_EMAIL_NOTIFICATIONS}
                type={FormFieldType.CHECKBOX}
                register={register(SettingsKey.HAS_EMAIL_NOTIFICATIONS)}
                error={errors.hasEmailNotifications}
              />
            </Card>
            <Card
              title="Security"
              color={CardHeaderColor.ORANGE}
              className={styles.card}
            >
              <FormField
                label={FormFieldLabel.IS_SHOWN_IN_RATING}
                type={FormFieldType.CHECKBOX}
                register={register(SettingsKey.IS_SHOWN_IN_RATING)}
                error={errors.isShownInRating}
              />
            </Card>
            <Card
              title="Sound effects"
              color={CardHeaderColor.PINK}
              className={styles.card}
            >
              <FormField
                label={FormFieldLabel.IS_SOUND_TURNED_ON}
                type={FormFieldType.CHECKBOX}
                register={register(SettingsKey.IS_SOUND_TURNED_ON)}
                error={errors.isSoundTurnedOn}
              />
            </Card>
          </div>
        </div>
        <Button
          onClick={() => void handleSubmit(handleSubmitForm)}
          label="Apply"
          isLoading={isUpdateLoading}
          className={styles.submitButton}
        />
      </RBForm>
    </ContentWrapper>
  );
};

export { Settings };
