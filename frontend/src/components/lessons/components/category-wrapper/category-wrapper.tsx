import { CreatorType } from 'common/enums/enums';
import { FC, JSX } from 'common/types/types';
import { clsx } from 'helpers/helpers';

import styles from './styles.module.scss';

type Props = {
  children: JSX.Element;
  prevLessonCreatorType?: CreatorType;
  currentLessonCreatorType: CreatorType;
};

const CategoryWrapper: FC<Props> = ({
  children,
  prevLessonCreatorType,
  currentLessonCreatorType,
}) => {
  const needToRenderCategoryTitle =
    !prevLessonCreatorType ||
    (prevLessonCreatorType !== currentLessonCreatorType &&
      prevLessonCreatorType === CreatorType.CURRENT_USER);
  const categoryTitle = !prevLessonCreatorType ? 'Personal' : 'Others';
  return (
    <div
      className={clsx(needToRenderCategoryTitle && styles.lessonCardWithTitle)}
    >
      {needToRenderCategoryTitle && <h1>{categoryTitle}</h1>}
      {children}
    </div>
  );
};

export { CategoryWrapper };
