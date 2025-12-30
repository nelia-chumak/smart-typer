import { FormFieldLabel, FormFieldType, RoomKey } from 'common/enums/enums';
import {
  CreateRoomRequestDto,
  FC,
  VoidAction,
  VoidCallback,
} from 'common/types/types';
import { FormField, Modal } from 'components/common/common';
import { useForm } from 'hooks/hooks';
import { createRoomSchema } from 'validation-schemas/validation-schemas';

import styles from './styles.module.scss';

type Props = {
  isVisible: boolean;
  onClose: VoidAction;
  onSubmit: VoidCallback<CreateRoomRequestDto>;
  isSubmitting: boolean;
};

const CreateRoomModal: FC<Props> = ({
  isVisible,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<CreateRoomRequestDto>(createRoomSchema, {
    [RoomKey.NAME]: '',
    [RoomKey.IS_PRIVATE]: false,
  });

  const handleClose = (): void => {
    reset();
    onClose();
  };

  return (
    <Modal
      isVisible={isVisible}
      cancelButton={{
        label: 'Cancel',
        isDisabled: isSubmitting,
        onClick: handleClose,
      }}
      submitButton={{
        label: 'Save',
        isDisabled: isSubmitting,
        onClick: () => void handleSubmit(onSubmit),
      }}
      title="Create new room"
      className={styles.createRoomModal}
    >
      <FormField
        label={FormFieldLabel.ROOM_NAME}
        type={FormFieldType.TEXT}
        placeholder="Enter room name"
        register={register(RoomKey.NAME)}
        error={errors.name}
      />
      <FormField
        type={FormFieldType.CHECKBOX}
        register={register(RoomKey.IS_PRIVATE)}
        label={FormFieldLabel.IS_PRIVATE}
      />
    </Modal>
  );
};

export { CreateRoomModal };
