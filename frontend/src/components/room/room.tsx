import { VOICE_URI } from 'common/constants/constants';
import { CommentatorEvent, SpinnerSize } from 'common/enums/enums';
import { FC, UserDto } from 'common/types/types';
import { Button, Spinner, TypingCanvas } from 'components/common/common';
import { clsx } from 'helpers/helpers';
import {
  useDispatch,
  useEffect,
  useMemo,
  useNavigate,
  useParams,
  useRef,
  useShallowSelector,
  useState,
} from 'hooks/hooks';
import {
  lessons as lessonsActions,
  racing as racingActions,
} from 'store/modules/actions';
import { Participant, ResultsModal } from './components/components';
import { mapParticipantsToRating } from './helpers/helpers';

import commentatorImage from 'assets/img/commentator.gif';
import styles from './styles.module.scss';

const Room: FC = () => {
  const {
    user,
    currentRoom,
    isLoadCurrentRoomFailed,
    isSoundTurnedOn,
    lesson,
  } = useShallowSelector(({ racing, auth, settings, lessons }) => ({
    user: auth.user,
    currentRoom: racing.currentRoom,
    isLoadCurrentRoomFailed: racing.isLoadCurrentRoomFailed,
    isSoundTurnedOn: settings.isSoundTurnedOn,
    lesson: lessons.currentLesson,
  }));

  const { commentatorText, gameTime, countdownBeforeGame, name, participants } =
    currentRoom ?? {};

  const { content, timestamps, misclicks } = lesson ?? {};

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const params = useParams();
  const roomId = Number(params.id);
  const userId = (user as UserDto).id;
  const currentParticipant = participants?.find(
    (participant) => participant.id === userId,
  );
  const allParticipantsAreReady = useMemo(
    () => participants?.every((participant) => participant.isReady),
    [participants],
  );

  const [isResultsModalVisible, setIsResultsModalVisible] = useState(false);

  const handleLeaveRoom = (): void => {
    navigate(-1);
  };

  const handleIncreasePosition = (): void => {
    dispatch(
      racingActions.increaseCurrentParticipantPosition({
        participantId: userId,
        roomId,
      }),
    );

    dispatch(lessonsActions.addTimestamp(Date.now()));
  };

  const handlePreservePosition = (): void => {
    dispatch(lessonsActions.addMisclick(currentParticipant!.position));
  };

  const handleParticipantFinishedGame = (participantId: number): void => {
    dispatch(racingActions.toggleParticipantIsReady({ participantId }));
    dispatch(
      racingActions.setSpentTime({
        id: participantId,
        spentTime: [...timestamps!].pop()! - [...timestamps!].shift()!,
      }),
    );
  };

  const handleToggleIsReady = (): void => {
    if (currentParticipant) {
      if (!content) {
        void dispatch(racingActions.addLessonId({ roomId }));
      }
      dispatch(
        racingActions.toggleCurrentParticipantIsReady({
          participantId: userId,
          roomId,
        }),
      );
    }
  };

  const handleTypingStart = (): void => {
    dispatch(lessonsActions.addTimestamp(Date.now()));
  };

  const handleLoadCommentatorText = (
    gameTimerValue?: number,
    quatre?: number,
  ): void => {
    if (!gameTimerValue || !quatre) {
      void dispatch(
        racingActions.loadCommentatorText(CommentatorEvent.GAME_START),
      );
      return;
    }
    if (gameTimerValue === 2 * quatre) {
      void dispatch(
        racingActions.loadCommentatorText(CommentatorEvent.GAME_MIDDLE),
      );
    }
  };

  const handleResults = (): void => {
    setIsResultsModalVisible(true);
    void dispatch(lessonsActions.sendLessonResult());
  };

  const handleCloseResultsModal = (): void => {
    setIsResultsModalVisible(false);
    void dispatch(racingActions.resetCurrentRoomToDefault());
    void dispatch(racingActions.removeLessonId({ roomId }));
  };

  const handleCommentatorTextChange = (): void => {
    if (!commentatorText || !isSoundTurnedOn) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(commentatorText);
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (roomId) {
      void dispatch(racingActions.loadCurrentRoom({ roomId }));
    }
  }, [roomId]);

  useEffect(() => {
    if (isLoadCurrentRoomFailed) {
      navigate(-1);
      dispatch(racingActions.resetIsLoadCurrentRoomFailed());
    }
  }, [isLoadCurrentRoomFailed]);

  useEffect(handleCommentatorTextChange, [commentatorText]);

  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const preloadVoice = (voiceURI: string): void => {
    const pick = (): SpeechSynthesisVoice | null => {
      const voices = speechSynthesis.getVoices();
      if (!voices.length) return null;
      return (
        voices.find((v) => v.voiceURI === voiceURI) ??
        voices.find((v) => v.lang?.toLowerCase().startsWith('en')) ??
        voices[0] ??
        null
      );
    };

    const set = (): void => {
      const v = pick();
      if (v) voiceRef.current = v;
    };

    set();

    const onChanged = (): void => {
      set();
      if (voiceRef.current) {
        speechSynthesis.removeEventListener('voiceschanged', onChanged);
      }
    };

    if (!voiceRef.current) {
      speechSynthesis.addEventListener('voiceschanged', onChanged);

      window.setTimeout(() => {
        speechSynthesis.removeEventListener('voiceschanged', onChanged);
        set();
      }, 1000);
    }
  };

  useEffect(() => {
    preloadVoice(VOICE_URI);

    const loadJoke = (): void => {
      void dispatch(racingActions.loadCommentatorText(CommentatorEvent.JOKE));
    };

    loadJoke();

    const id = window.setInterval(loadJoke, 60000);

    return (): void => {
      window.clearInterval(id);
      speechSynthesis.cancel();
      void dispatch(racingActions.leaveRoom({ roomId, participantId: userId }));
      dispatch(racingActions.resetAllExceptPersonal());
    };
  }, []);

  return (
    <div className={styles.room}>
      {!currentRoom || !currentParticipant ? (
        <Spinner size={SpinnerSize.LARGE} />
      ) : (
        <>
          <div className={styles.info}>
            <h1>{name}</h1>
            <Button
              onClick={handleLeaveRoom}
              isDisabled={allParticipantsAreReady}
              className={clsx(
                styles.goBackButton,
                allParticipantsAreReady && styles.disabled,
              )}
              label="Go back"
            />
            {participants!.map((participant) => (
              <Participant
                participant={participant}
                key={participant.id}
                textLength={content?.length}
                isCurrentUser={participant.id === currentParticipant?.id}
              />
            ))}
          </div>
          <TypingCanvas
            participants={participants ?? []}
            currentUserId={userId}
            lessonContent={lesson?.content}
            gameTime={gameTime}
            countdownBeforeGame={countdownBeforeGame}
            misclicks={misclicks}
            isSoundTurnedOn={isSoundTurnedOn}
            onTypingStart={handleTypingStart}
            onLoadCommentatorText={handleLoadCommentatorText}
            onIncreasePosition={handleIncreasePosition}
            onPreservePosition={handlePreservePosition}
            onUserFinishedTyping={handleParticipantFinishedGame}
            onResults={handleResults}
            onToggleIsReady={handleToggleIsReady}
            isGameMode
          />
          <div className={styles.commentator}>
            <div className={styles.speechBubble}>
              {(commentatorText as string).split('\n').map((line, i) => {
                return (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                );
              })}
            </div>
            <div className={styles.commentatorImgContainer}>
              <img src={commentatorImage} className={styles.commentatorImg} />
            </div>
          </div>
          <ResultsModal
            participantsRating={mapParticipantsToRating(participants!)}
            isVisible={isResultsModalVisible}
            onClose={handleCloseResultsModal}
          ></ResultsModal>
        </>
      )}
    </div>
  );
};

export { Room };
