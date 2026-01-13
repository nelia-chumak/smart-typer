import {
  AlphabetLetter,
  CommonKey,
  ContentType,
  CreatorType,
  FormFieldLabel,
  FormFieldType,
  PaginationKey,
  SpinnerSize,
} from 'common/enums/enums';
import { IOption, IPaginationRequest } from 'common/interfaces/interfaces';
import {
  CreateLessonRequestDto,
  FC,
  LessonDto,
  LessonFilters,
} from 'common/types/types';
import {
  ArMarkerModal,
  Button,
  FormField,
  LessonCard,
  Select,
  Spinner,
} from 'components/common/common';
import { ReactInfiniteScroll } from 'components/external/external';
import {
  useDispatch,
  useEffect,
  useShallowSelector,
  useState,
} from 'hooks/hooks';
import { lessons as lessonsActions } from 'store/modules/actions';
import {
  CONTENT_TYPE_OPTIONS,
  CREATOR_TYPE_OPTIONS,
} from './common/constants/constants';
import { CreateLessonModal } from './components/components';
import { getFiltersParams } from './helpers/helpers';

import styles from './styles.module.scss';
import { clsx } from 'helpers/helpers';

const getCategoryTitle = (creatorType: CreatorType): string =>
  creatorType === CreatorType.CURRENT_USER ? 'Personal' : 'Others';

const Lessons: FC = () => {
  const { lessons, isLessonCreating, allLessonsCount } = useShallowSelector(
    ({ lessons, requests }) => ({
      lessons: lessons.lessons,
      allLessonsCount: lessons.allLessonsCount,
      isLessonCreating: requests.lessonsCreate,
    }),
  );

  const dispatch = useDispatch();

  const [contentTypeFilter, setContentTypeFilter] = useState<
    IOption<ContentType>
  >([...CONTENT_TYPE_OPTIONS].shift()!);
  const [creatorTypeFilter, setCreatorTypeFilter] = useState<
    IOption<CreatorType>
  >([...CREATOR_TYPE_OPTIONS].shift()!);

  const areFiltersSet = !!(contentTypeFilter.value || creatorTypeFilter.value);

  const [isCreateLessonModalVisible, setIsCreateLessonModalVisible] =
    useState(false);
  const [arMarkerSymbol, setArMarkerSymbol] = useState<AlphabetLetter | null>(
    null,
  );

  const handleToggleCreateLessonModalVisible = (): void => {
    setIsCreateLessonModalVisible((prev: boolean) => !prev);
  };

  const handleCloseArModal = (): void => {
    setArMarkerSymbol(null);
  };

  const handleCreateLessonSubmit = (payload: CreateLessonRequestDto): void => {
    void dispatch(lessonsActions.create(payload));
  };

  const handleLoadMoreLessons = (): void => {
    const params = getFiltersParams(
      contentTypeFilter,
      creatorTypeFilter,
    ) as Pick<IPaginationRequest, PaginationKey.OFFSET> & LessonFilters;
    params.offset = lessons.length;

    void dispatch(lessonsActions.loadMoreLessons(params));
  };

  const handleLoadFilteredLessons = (): void => {
    const params = getFiltersParams(contentTypeFilter, creatorTypeFilter);
    void dispatch(lessonsActions.loadLessons(params));
  };

  const handleDeleteLesson = (lessonId: LessonDto[CommonKey.ID]): void => {
    void dispatch(lessonsActions.delete({ lessonId }));
  };

  useEffect(() => {
    handleLoadFilteredLessons();
  }, [contentTypeFilter, creatorTypeFilter]);

  return (
    <div className={styles.lessons}>
      <div className={styles.actions}>
        <FormField
          label={FormFieldLabel.CONTENT_TYPE}
          type={FormFieldType.CUSTOM}
          className={styles.filter}
        >
          <Select<ContentType>
            options={CONTENT_TYPE_OPTIONS}
            value={contentTypeFilter}
            onChange={setContentTypeFilter}
          />
        </FormField>
        <FormField
          label={FormFieldLabel.CREATOR_TYPE}
          type={FormFieldType.CUSTOM}
          className={styles.filter}
        >
          <Select<CreatorType>
            options={CREATOR_TYPE_OPTIONS}
            value={creatorTypeFilter}
            onChange={setCreatorTypeFilter}
          />
        </FormField>
        <Button
          label="Create lesson"
          onClick={handleToggleCreateLessonModalVisible}
          className={styles.createLessonButton}
        ></Button>
      </div>
      <ReactInfiniteScroll
        dataLength={lessons.length}
        next={handleLoadMoreLessons}
        hasMore={lessons.length < allLessonsCount}
        loader={
          <div className={styles.spinnerContainer}>
            <Spinner size={SpinnerSize.SMALL} isCentered={false} />
          </div>
        }
        className={styles.infiniteScroll}
      >
        <div className={styles.lessonCards}>
          {lessons.map((lesson, i) => {
            const showTitle =
              !areFiltersSet &&
              lessons[i - 1]?.creatorType !== lesson.creatorType;

            return (
              <div
                key={lesson.id}
                className={clsx(showTitle && styles.lessonCardWithTitle)}
              >
                {showTitle && <h1>{getCategoryTitle(lesson.creatorType)}</h1>}

                <LessonCard
                  lesson={lesson}
                  onArMarkerClick={setArMarkerSymbol}
                  onDeleteLesson={handleDeleteLesson}
                />
              </div>
            );
          })}
        </div>
      </ReactInfiniteScroll>
      <CreateLessonModal
        isVisible={isCreateLessonModalVisible}
        onClose={handleToggleCreateLessonModalVisible}
        onSubmit={handleCreateLessonSubmit}
        isSubmitting={isLessonCreating}
      />
      <ArMarkerModal
        onClose={handleCloseArModal}
        isVisible={!!arMarkerSymbol}
        bestSkillSymbol={arMarkerSymbol}
      />
    </div>
  );
};

export { Lessons };
