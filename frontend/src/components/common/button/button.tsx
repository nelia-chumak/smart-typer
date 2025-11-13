import { SpinnerSize } from 'common/enums/enums';
import { FC, JSX, SyntheticEvent, VoidCallback } from 'common/types/types';
import { Spinner } from 'components/common/common';
import { clsx } from 'helpers/helpers';

import styles from './styles.module.scss';

type Props = {
  label?: string;
  iconName?: string;
  className?: string;
  iconClassName?: string;
  onClick: VoidCallback<SyntheticEvent>;
  isLoading?: boolean;
  isDisabled?: boolean;
  hasShadowOnHover?: boolean;
  children?: JSX.Element | JSX.Element[];
};

const Button: FC<Props> = ({
  label,
  iconName,
  className,
  iconClassName,
  onClick,
  isLoading = false,
  isDisabled = false,
  hasShadowOnHover = true,
  children,
}) => {
  const handleClick = (e: SyntheticEvent): void => {
    e.preventDefault();
    onClick(e);
  };

  return (
    <button
      className={clsx(
        styles.button,
        className,
        hasShadowOnHover && styles.hasShadowOnHover,
      )}
      disabled={isDisabled || isLoading}
      onClick={isDisabled ? undefined : handleClick}
    >
      {isLoading ? (
        <Spinner size={SpinnerSize.SMALL} isCentered={false} />
      ) : (
        <>
          {iconName && <i className={clsx(iconName, iconClassName)}></i>}
          {label && <span>{label}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export { Button };
