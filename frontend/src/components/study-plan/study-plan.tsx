import { AlphabetLetter, SpinnerSize } from 'common/enums/enums';
import { FC } from 'common/types/types';
import { Spinner, LessonCard, ArMarkerModal } from 'components/common/common';
import { useDispatch, useEffect, useSelector, useState } from 'hooks/hooks';
import { lessons as lessonsActions } from 'store/modules/actions';

import styles from './styles.module.scss';

const StudyPlan: FC = () => {
  const dispatch = useDispatch();
  const {
    studyPlanLessons,
    areStudyPlanLessonsLoading,
    isNextLessonGenerating,
  } = useSelector(({ lessons, requests }) => ({
    studyPlanLessons: lessons.studyPlan,
    areStudyPlanLessonsLoading: requests.lessonsLoadStudyPlan,
    isNextLessonGenerating: requests.lessonSendLessonResult,
  }));

  const [arMarkerSymbol, setArMarkerSymbol] = useState<AlphabetLetter | null>(
    null,
  );

  const handleCloseArModal = (): void => {
    setArMarkerSymbol(null);
  };

  useEffect(() => {
    void dispatch(lessonsActions.loadStudyPlan());
    return (): void => {
      dispatch(lessonsActions.resetStudyPlan());
    };
  }, []);

  return (
    <div className={styles.rooms}>
      <h1>Discover your personal study plan</h1>
      {areStudyPlanLessonsLoading ? (
        <Spinner size={SpinnerSize.LARGE} />
      ) : (
        <ol className={styles.lessonCards} role="list">
          {studyPlanLessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              isStudyPlan
              onArMarkerClick={setArMarkerSymbol}
            />
          ))}
          {isNextLessonGenerating && (
            <LessonCard
              key="next"
              isGenerating
              isStudyPlan
              onArMarkerClick={setArMarkerSymbol}
            />
          )}
        </ol>
      )}
      <ArMarkerModal
        onClose={handleCloseArModal}
        isVisible={!!arMarkerSymbol}
        bestSkillSymbol={arMarkerSymbol}
      />
    </div>
  );
};

export { StudyPlan };
