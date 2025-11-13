import { ContentWrapperShadow, ContentWrapperSize } from 'common/enums/enums';
import { FC, JSX } from 'common/types/types';
import { clsx } from 'helpers/helpers';

import styles from './styles.module.scss';

type Props = {
  size: ContentWrapperSize;
  shadow?: ContentWrapperShadow;
  className?: string;
  children: JSX.Element | JSX.Element[];
};

const ContentWrapper: FC<Props> = ({
  children,
  size,
  className,
  shadow = ContentWrapperShadow.STRONG,
}) => {
  return (
    <div
      className={clsx(
        styles.contentWrapper,
        styles[size],
        styles[shadow],
        className,
      )}
    >
      {children}
    </div>
  );
};

export { ContentWrapper };
