import { FC, JSX, ModalButton, VoidAction } from 'common/types/types';
import { Button } from 'components/common/common';
import { RBModal } from 'components/external/external';
import { clsx } from 'helpers/helpers';

import styles from './styles.module.scss';

type Props = {
  children: JSX.Element | JSX.Element[] | null;
  isVisible: boolean;
  submitButton?: ModalButton;
  cancelButton?: ModalButton;
  title?: string;
  className?: string;
  dialogClassName?: string;
  onHide?: VoidAction;
};

const Modal: FC<Props> = ({
  children,
  isVisible,
  submitButton,
  cancelButton,
  title,
  className,
  dialogClassName,
  onHide,
}) => {
  const hasHeader = Boolean(title);
  const hasFooter = cancelButton || submitButton;
  return (
    <RBModal
      contentClassName={clsx(styles.modal, className)}
      dialogClassName={clsx(styles.dialog, dialogClassName)}
      show={isVisible}
      onHide={onHide ?? cancelButton?.onClick}
      backdrop="static"
      keyboard={false}
      centered
    >
      {hasHeader && (
        <RBModal.Header closeButton>
          <RBModal.Title className={styles.title}>{title}</RBModal.Title>
        </RBModal.Header>
      )}
      <RBModal.Body>{children}</RBModal.Body>
      {hasFooter && (
        <RBModal.Footer>
          {cancelButton && (
            <Button
              onClick={cancelButton.onClick}
              isDisabled={cancelButton.isDisabled}
              label={cancelButton.label}
              className={clsx(styles.button, styles.cancelButton)}
            />
          )}
          {submitButton && (
            <Button
              onClick={submitButton.onClick}
              isDisabled={submitButton.isDisabled}
              label={submitButton.label}
              className={clsx(styles.button, styles.submitButton)}
            />
          )}
        </RBModal.Footer>
      )}
    </RBModal>
  );
};

export { Modal };
