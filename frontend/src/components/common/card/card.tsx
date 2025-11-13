import { FC, JSX, VoidAction } from 'common/types/types';
import { CardHeaderColor, CardSize } from 'common/enums/enums';
import { clsx } from 'helpers/helpers';
import { Button } from 'components/common/common';

import styles from './styles.module.scss';

type Props = {
  title?: string;
  color: CardHeaderColor;
  className?: string;
  childrenContainerClassName?: string;
  children: JSX.Element | JSX.Element[];
  numbered?: boolean;
  size?: CardSize;
  centeredTitle?: boolean;
  onRemove?: VoidAction;
};

const Card: FC<Props> = ({
  color,
  title,
  className,
  children,
  childrenContainerClassName,
  onRemove,
  numbered = false,
  size = CardSize.MEDIUM,
  centeredTitle = false,
}) => {
  return (
    <div
      className={clsx(
        styles.card,
        styles[color],
        styles[size],
        numbered && styles.numbered,
        className,
      )}
    >
      <div className={styles.cardHeader}>
        {!!title && (
          <h3 className={clsx(styles.title, centeredTitle && styles.centered)}>
            {title}
          </h3>
        )}
        {onRemove && (
          <Button
            onClick={onRemove}
            iconName="bi bi-trash3"
            className={styles.removeButton}
            iconClassName={styles.removeIcon}
          />
        )}
      </div>
      <div className={clsx(childrenContainerClassName)}>{children}</div>
    </div>
  );
};

export { Card };
