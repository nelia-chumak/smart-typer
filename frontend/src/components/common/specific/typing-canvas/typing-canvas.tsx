import {
  DEFAULT_COUNTDOWN_BEFORE_LESSON,
  DEFAULT_SETTINGS,
  VOID_ACTION,
} from 'common/constants/constants';
import {
  CommonKey,
  ParticipantKey,
  SettingsKey,
  SkillsStatisticKey,
} from 'common/enums/enums';
import {
  FC,
  KeyboardEvent,
  Participant,
  SettingsDto,
  SkillsStatisticsDto,
  UserDto,
  VoidAction,
} from 'common/types/types';
import { Button } from 'components/common/common';
import { clsx } from 'helpers/helpers';
import { useEffect, useRef, useSound, useState } from 'hooks/hooks';
import { setTimer } from './helpers/helpers';

import styles from './styles.module.scss';

type Typer = {
  [ParticipantKey.POSITION]: Participant[ParticipantKey.POSITION];
  [ParticipantKey.IS_READY]?: Participant[ParticipantKey.IS_READY];
  [ParticipantKey.SPENT_TIME]: Participant[ParticipantKey.SPENT_TIME];
  [CommonKey.ID]: Participant[CommonKey.ID];
};

type Props = {
  participants: Typer[];
  currentUserId: UserDto[CommonKey.ID];
  isSoundTurnedOn: SettingsDto[SettingsKey.IS_SOUND_TURNED_ON];
  onResults: VoidAction;
  onIncreasePosition: VoidAction;
  onPreservePosition: VoidAction;
  onTypingStart: VoidAction;
  onUserFinishedTyping: (participantId: UserDto[CommonKey.ID]) => void;
  isGameMode?: boolean;
  lessonContent?: string;
  misclicks?: SkillsStatisticsDto[SkillsStatisticKey.MISCLICKS];
  gameTime?: SettingsDto[SettingsKey.GAME_TIME];
  countdownBeforeGame?: SettingsDto[SettingsKey.GAME_TIME];
  onLoadCommentatorText?: (gameTimerValue?: number, quatre?: number) => void;
  onToggleIsReady?: VoidAction;
};

const TypingCanvas: FC<Props> = ({
  participants,
  currentUserId,
  lessonContent,
  misclicks,
  gameTime,
  countdownBeforeGame,
  isSoundTurnedOn,
  onLoadCommentatorText,
  onIncreasePosition,
  onPreservePosition,
  onTypingStart,
  onUserFinishedTyping,
  onResults,
  onToggleIsReady = VOID_ACTION,
  isGameMode = false,
}) => {
  const {
    gameTime: defaultGameTime,
    countdownBeforeGame: defaultCountdownBeforeGame,
  } = DEFAULT_SETTINGS;

  const gameTimerInitialValue = isGameMode
    ? (gameTime ?? defaultGameTime)
    : null;
  const timerBeforeTypingInitialValue = isGameMode
    ? (countdownBeforeGame ?? defaultCountdownBeforeGame)
    : DEFAULT_COUNTDOWN_BEFORE_LESSON;

  const [isStarted, setIsStarted] = useState(!isGameMode);
  const [gameTimerValue, setGameTimerValue] = useState(gameTimerInitialValue);
  const [timerBeforeTypingValue, setTimerBeforeTypingValue] = useState(
    timerBeforeTypingInitialValue,
  );

  const currentParticipant = participants.find(
    (participant) => participant.id === currentUserId,
  );

  const { position, spentTime, isReady } = currentParticipant ?? {};

  const [playError] = useSound(
    `${import.meta.env.VITE_PUBLIC_URL}/sound/error.mp3`,
    {
      volume: 0.25,
    },
  );
  const [playClockTick] = useSound(
    `${import.meta.env.VITE_PUBLIC_URL}/sound/clock-tick.mp3`,
    {
      volume: 0.25,
      interrupt: true,
    },
  );
  const [playClockRing] = useSound(
    `${import.meta.env.VITE_PUBLIC_URL}/sound/clock-ring.mp3`,
    {
      volume: 0.25,
    },
  );

  const playClockTickRef = useRef(playClockTick);

  useEffect(() => {
    playClockTickRef.current = playClockTick;
  }, [playClockTick]);

  const pageRef = useRef<HTMLDivElement | null>(null);

  const handleDecreaseTimerBeforeTypingValue = (timerValue: number): void => {
    if (timerValue !== timerBeforeTypingValue) {
      setTimerBeforeTypingValue(timerValue);
    }
    if (isSoundTurnedOn && timerValue > 0) {
      playClockTickRef.current();
    }
  };

  const handleDecreaseGameTimerValue = (timerValue: number): void => {
    if (timerValue !== gameTimerValue) {
      setGameTimerValue(timerValue);
    }
    if (isSoundTurnedOn && timerValue > 0) {
      playClockTickRef.current();
    }
  };

  const handleResetTimerValues = (): void => {
    setTimerBeforeTypingValue(timerBeforeTypingInitialValue);
    setGameTimerValue(gameTimerInitialValue);
  };

  const handleKeyDown = ({ key }: KeyboardEvent<HTMLDivElement>): void => {
    if (!isStarted) {
      return;
    }

    const currentSymbol = (lessonContent as string)[position!];

    const isRightSymbol = key === currentSymbol;
    if (isRightSymbol) {
      onIncreasePosition();
    } else if (key !== 'Shift') {
      onPreservePosition();
      if (isSoundTurnedOn) {
        playError();
      }
    }
  };

  const handleParticipantsChange = (): void => {
    if (!participants.length) {
      return;
    }
    const allParticipantsEndedGame = participants.every(
      (participant) => participant.spentTime,
    );
    const needToFinishGame = isStarted && allParticipantsEndedGame;
    if (needToFinishGame) {
      setIsStarted(false);
    }
    if (lessonContent?.length) {
      const { length } = lessonContent;
      participants.forEach((participant) => {
        const participantTypedAllText = participant.position === length;
        const participantNotSetSpentTime = !participant.spentTime;
        if (participantTypedAllText && participantNotSetSpentTime) {
          onUserFinishedTyping(participant.id);
        }
      });
    }

    if (!isGameMode) {
      return;
    }

    const allParticipantsAreReady = participants.every(
      (participant) => participant.isReady,
    );
    const needToStartGame = !isStarted && allParticipantsAreReady;
    if (needToStartGame) {
      setIsStarted(true);
    }
  };

  const handleStartedStateChange = (): void => {
    const shouldStartTimerBeforeTypingCountdown = isStarted && !spentTime;
    const shouldFinishGame = !isStarted && !!spentTime;

    if (shouldStartTimerBeforeTypingCountdown) {
      if (isSoundTurnedOn) {
        onLoadCommentatorText?.();
        playClockTick();

        setTimeout(() => playClockTickRef.current(), 50);
      }

      setTimer(timerBeforeTypingValue, handleDecreaseTimerBeforeTypingValue);
      return;
    }

    if (shouldFinishGame) {
      if (isSoundTurnedOn) playClockRing();
      handleResetTimerValues();
      onResults();
    }
  };

  const handleTimerBeforeTypingChange = (): void => {
    if (!timerBeforeTypingValue && isStarted) {
      onTypingStart();
      pageRef.current?.focus();

      if (isSoundTurnedOn) {
        playClockRing();
      }

      if (isGameMode) {
        if (isSoundTurnedOn) {
          setTimeout(() => playClockTickRef.current(), 50);
        }

        setTimer(gameTimerValue as number, handleDecreaseGameTimerValue);
      }
    }
  };

  const handleGameTimerChange = (): void => {
    if (!gameTimerValue && isStarted && isGameMode) {
      (participants as Participant[]).forEach((participant) => {
        const hadFinishGameBeforeDeadline = participant.spentTime;
        if (!hadFinishGameBeforeDeadline) {
          onUserFinishedTyping(participant.id);
        }
      });
    }
    if (gameTimerValue && isSoundTurnedOn) {
      const quatre = Math.round((gameTime ?? defaultGameTime) / 4);
      onLoadCommentatorText?.(gameTimerValue, quatre);
    }
  };

  useEffect(handleParticipantsChange, [participants]);
  useEffect(handleStartedStateChange, [isStarted, spentTime]);
  useEffect(handleTimerBeforeTypingChange, [timerBeforeTypingValue]);
  useEffect(handleGameTimerChange, [gameTimerValue]);

  return (
    <div
      ref={pageRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={styles.typingCanvas}
    >
      {isStarted ? (
        timerBeforeTypingValue ? (
          <span className={styles.timerBeforeTyping}>
            {timerBeforeTypingValue}
          </span>
        ) : (
          <>
            {isGameMode && (
              <p className={styles.gameTimer}>
                {gameTimerValue === 1
                  ? `${gameTimerValue} second left`
                  : `${gameTimerValue} seconds left`}
              </p>
            )}
            <p>
              {[...lessonContent!].map((symbol, i) => {
                const isTyped = position! > i;
                const isCurrent = i === position!;
                const wasWrong = !!misclicks?.[i];

                const isCurrentWrong = isCurrent && wasWrong;
                const isTypedCorrected = isTyped && wasWrong;
                const isTypedClean = isTyped && !wasWrong;

                const className = clsx(
                  isCurrentWrong && styles.incorrectTyped,
                  isTypedCorrected && styles.correctedTyped,
                  isTypedClean && styles.correctTyped,
                );
                return (
                  <span key={i} className={className}>
                    {symbol}
                  </span>
                );
              })}
            </p>
          </>
        )
      ) : (
        isGameMode && (
          <Button
            onClick={onToggleIsReady}
            label={isReady ? 'Not ready' : 'Ready'}
            className={clsx(
              styles.readyButton,
              isReady ? styles.ready : styles.notReady,
            )}
          />
        )
      )}
    </div>
  );
};

export { TypingCanvas };
