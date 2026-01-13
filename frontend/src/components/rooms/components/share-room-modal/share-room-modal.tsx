import {
  AppRoute,
  FormFieldLabel,
  FormFieldType,
  ShareUrlKey,
} from 'common/enums/enums';
import {
  ClassNames,
  FC,
  SendRoomUrlToEmailsRequestDto,
  ShareRoomUrlDto,
  Tag,
  TagRenderer,
  VoidAction,
} from 'common/types/types';
import { Button, FormField, Modal } from 'components/common/common';

import { ReactTags } from 'components/external/external';
import { clsx, replaceRouteIdParam } from 'helpers/helpers';
import { useDispatch, useForm, useMemo, useNavigate } from 'hooks/hooks';
import { racing as racingActions } from 'store/modules/actions';
import { sendShareRoomUrlSchema } from 'validation-schemas/validation-schemas';

import styles from './styles.module.scss';

type Props = {
  isVisible: boolean;
  onClose: VoidAction;
  shareRoomUrl: ShareRoomUrlDto[ShareUrlKey.URL];
  isRoomUrlSending: boolean;
};

type Emails = SendRoomUrlToEmailsRequestDto[ShareUrlKey.EMAILS];

const ShareRoomModal: FC<Props> = ({
  isVisible,
  onClose,
  shareRoomUrl,
  isRoomUrlSending,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { handleSubmit, setValue, watch } =
    useForm<SendRoomUrlToEmailsRequestDto>(sendShareRoomUrlSchema, {
      [ShareUrlKey.URL]: shareRoomUrl,
    });

  const emails = watch(ShareUrlKey.EMAILS);

  const setEmails = (next: Emails): void => {
    setValue(ShareUrlKey.EMAILS as keyof SendRoomUrlToEmailsRequestDto, next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSend = (data: SendRoomUrlToEmailsRequestDto): void => {
    void dispatch(racingActions.sendRoomUrlToEmails(data));
  };

  const handleRenderTag: TagRenderer = ({
    classNames,
    tag,
    ...buttonProps
  }) => (
    <button
      type="button"
      className={clsx(classNames.tag, styles.emailTag)}
      data-tag
      {...buttonProps}
    >
      <span className={clsx(classNames.tagName, styles.emailTagName)}>
        {tag.label}
      </span>
      <span className={styles.emailTagRemove} aria-hidden>
        ×
      </span>
    </button>
  );

  const handleGoToCreatedRoom = (): void => {
    const shareRoomId = Number(shareRoomUrl.split('/').pop());
    const route = replaceRouteIdParam(AppRoute.ROOMS_$ID, shareRoomId);
    navigate(route);
  };

  const handleValidateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  };

  const handleAdd = (tag: Tag): void => {
    const raw = (tag.value ?? tag.label ?? '').toString();
    const email = raw.trim();
    if (!email) return;
    if (!handleValidateEmail(email)) return;
    if ((emails ?? []).includes(email)) return;
    setEmails([...(emails ?? []), email]);
  };

  const handleDelete = (index: number): void => {
    setEmails((emails ?? []).filter((_, i) => i !== index));
  };

  const selected = useMemo(
    () => (emails ?? []).map((e) => ({ value: e, label: e })),
    [emails],
  );

  const suggestions: Tag[] = [];

  const classNames = useMemo(
    () =>
      ({
        root: styles.emailsRoot,
        rootIsActive: styles.emailsRootActive,
        rootIsDisabled: '',
        rootIsInvalid: '',
        label: styles.label,
        tagList: styles.tagList,
        tagListItem: '',
        tag: '',
        tagName: '',
        comboBox: styles.comboBox,
        input: styles.input,
        listBox: styles.listBox,
        option: styles.option,
        optionIsActive: styles.optionActive,
        highlight: '',
      }) as ClassNames,
    [],
  );

  return (
    <Modal
      isVisible={isVisible}
      cancelButton={{
        label: 'Cancel',
        isDisabled: isRoomUrlSending,
        onClick: onClose,
      }}
      submitButton={{
        label: 'Go to room',
        isDisabled: isRoomUrlSending,
        onClick: handleGoToCreatedRoom,
      }}
      title="Share room"
      className={styles.shareRoomModal}
    >
      <FormField
        value={shareRoomUrl}
        label={FormFieldLabel.LINK_TO_SHARE}
        readOnly
        hasCopyButton
        type={FormFieldType.TEXT}
        className={styles.shareRoomUrlField}
      />

      <FormField
        label={FormFieldLabel.EMAILS}
        type={FormFieldType.CUSTOM}
        note={<span>* correctly entered emails are greyed out</span>}
      >
        <ReactTags
          labelText=""
          suggestions={suggestions}
          selected={selected}
          onAdd={handleAdd}
          onDelete={handleDelete}
          onValidate={handleValidateEmail}
          allowNew
          placeholderText="Enter emails which you want to send link to"
          renderTag={handleRenderTag}
          classNames={classNames}
        />
      </FormField>

      <Button
        onClick={() => void handleSubmit(handleSend)()}
        className={styles.sendButton}
        isDisabled={isRoomUrlSending}
        label="Send"
      />
    </Modal>
  );
};

export { ShareRoomModal };
