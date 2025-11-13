import { FC, JSX } from 'common/types/types';
import { ImageAlignment } from 'components/theory/common/enums/enums';
import styles from './styles.module.scss';

type Props = {
  title: string;
  text: string;
  imageSrc?: string;
  imageAlignment?: ImageAlignment;
  children?: JSX.Element | JSX.Element[];
};

const Block: FC<Props> = ({
  children,
  title,
  text,
  imageSrc,
  imageAlignment = ImageAlignment.RIGHT,
}) => {
  return (
    <>
      <hr />
      <div className={styles.block}>
        <h2 className={styles.title}>{title}</h2>
        <div>
          <div className={styles.mainContent}>
            {imageSrc && imageAlignment === ImageAlignment.LEFT && (
              <img src={imageSrc} className={styles.image} />
            )}
            <p className={styles.text}>{text}</p>
            {imageSrc && imageAlignment === ImageAlignment.RIGHT && (
              <img src={imageSrc} className={styles.image} />
            )}
          </div>
          <p className={styles.text}>{children}</p>
        </div>
      </div>
    </>
  );
};

export { Block };
