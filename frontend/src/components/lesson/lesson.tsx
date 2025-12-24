import { AppRoute, SpinnerSize } from 'common/enums/enums';
import { FC, UserDto } from 'common/types/types';
import { Spinner, TypingCanvas } from 'components/common/common';
import {
  useDispatch,
  useEffect,
  useNavigate,
  useParams,
  useSelector,
  useState,
} from 'hooks/hooks';
import { lessons as lessonsActions } from 'store/modules/actions';
import { ResultsModal } from './components/components';
import { mapLessonStatisticsToResults } from './helpers/helpers';

import styles from './styles.module.scss';

const Lesson: FC = () => {
  const { user, isLoadCurrentRoomFailed, isSoundTurnedOn, currentLesson } =
    useSelector(({ racing, auth, settings, lessons }) => ({
      user: auth.user,
      currentRoom: racing.currentRoom,
      isLoadCurrentRoomFailed: racing.isLoadCurrentRoomFailed,
      isSoundTurnedOn: settings.isSoundTurnedOn,
      currentLesson: lessons.currentLesson,
    }));

  const { name, content, timestamps, misclicks } = currentLesson ?? {};

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const params = useParams();
  const lessonId = Number(params.id);
  const userId = (user as UserDto).id;

  const [isResultsModalVisible, setIsResultsModalVisible] = useState(false);
  const [position, setPosition] = useState(0);
  const [spentTime, setSpentTime] = useState(0);

  const handleIncreasePosition = (): void => {
    setPosition(position + 1);
    dispatch(lessonsActions.addTimestamp(Date.now()));
  };

  const handlePreservePosition = (): void => {
    dispatch(lessonsActions.addMisclick(position));
  };

  const handleTypingStart = (): void => {
    dispatch(lessonsActions.addTimestamp(Date.now()));
  };

  const handleUserFinishedTyping = (): void => {
    setSpentTime([...timestamps!].pop()! - [...timestamps!].shift()!);
  };

  const handleResults = (): void => {
    setIsResultsModalVisible(true);
    void dispatch(lessonsActions.sendLessonResult());
  };

  const handleCloseResultsModal = (): void => {
    setIsResultsModalVisible(false);
    navigate(-1);
  };

  useEffect(() => {
    if (lessonId) {
      void dispatch(lessonsActions.loadCurrent({ lessonId }));
    }
  }, [lessonId]);

  useEffect(() => {
    if (isLoadCurrentRoomFailed) {
      dispatch(lessonsActions.resetIsLoadCurrentLessonFailed());
      navigate(AppRoute.ROOMS);
    }
  }, [isLoadCurrentRoomFailed]);

  return (
    <div className={styles.lesson}>
      {!currentLesson ? (
        <Spinner size={SpinnerSize.LARGE} />
      ) : (
        <>
          <div className={styles.info}>
            <h1>{name}</h1>
          </div>
          <TypingCanvas
            participants={[{ position, id: userId, spentTime }]}
            currentUserId={userId}
            lessonContent={content}
            misclicks={misclicks}
            isSoundTurnedOn={isSoundTurnedOn}
            onTypingStart={handleTypingStart}
            onUserFinishedTyping={handleUserFinishedTyping}
            onIncreasePosition={handleIncreasePosition}
            onPreservePosition={handlePreservePosition}
            onResults={handleResults}
          />
          <ResultsModal
            lessonResult={mapLessonStatisticsToResults(currentLesson)}
            isVisible={isResultsModalVisible}
            onClose={handleCloseResultsModal}
          ></ResultsModal>
        </>
      )}
    </div>
  );
};

export { Lesson };
