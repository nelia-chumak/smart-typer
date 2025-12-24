import {
  CommentatorEvent,
  CommonKey,
  GameRoomKey,
  NotificationMessage,
  ParticipantKey,
  ShareUrlKey,
  UserKey,
} from 'common/enums/enums';
import {
  CreateRoomRequestDto,
  GameRoom,
  GameRoomWithOptionalFields,
  Participant,
  ParticipantIdDto,
  RequiredLessonIdDto,
  RoomDto,
  RoomIdDto,
  RoomIdParticipantIdDto,
  SendRoomUrlToEmailsRequestDto,
  ShareRoomUrlDto,
  UserDto,
} from 'common/types/types';
import {
  getGameCommentatorText,
  mapGameRoomToDefault,
  mapRoomToGameRoom,
  mapUserToParticipant,
} from 'helpers/helpers';
import { createAction, createAsyncThunk } from 'store/external/external';
import { ActionType } from './action-type';

class Racing {
  public setPersonalRoom = createAction(
    ActionType.SET_PERSONAL_ROOM,
    (payload: RoomDto) => ({ payload }),
  );

  public loadCurrentRoom = createAsyncThunk(
    ActionType.LOAD_CURRENT_ROOM,
    async (
      payload: RoomIdDto,
      { dispatch, extra: { services } },
    ): Promise<void> => {
      const { roomApi: roomApiService } = services;
      const room = await roomApiService.get(payload);
      void dispatch(this.setCurrentRoom(room));
    },
  );

  public resetIsLoadCurrentRoomFailed = createAction(
    ActionType.RESET_IS_LOAD_CURRENT_ROOM_FAILED,
  );

  public setPersonalRoomAsCurrent = createAsyncThunk(
    ActionType.SET_PERSONAL_ROOM_AS_CURRENT,
    async (_: undefined, { dispatch, getState }): Promise<void> => {
      const {
        racing: { personalRoom },
        settings: { gameTime, countdownBeforeGame },
      } = getState();
      if (!personalRoom) {
        return;
      }
      void dispatch(
        this.setCurrentRoom({ ...personalRoom, gameTime, countdownBeforeGame }),
      );
    },
  );

  public setCurrentRoom = createAsyncThunk(
    ActionType.SET_CURRENT_ROOM,
    async (
      payload: GameRoomWithOptionalFields,
      { dispatch },
    ): Promise<GameRoom> => {
      const currentRoom = mapRoomToGameRoom(payload);
      const { id: roomId } = payload;
      void dispatch(this.joinRoom({ roomId }));
      void dispatch(this.loadCommentatorText(CommentatorEvent.GREETING));
      return currentRoom;
    },
  );

  public joinRoom = createAsyncThunk(
    ActionType.JOIN_ROOM,
    async (
      payload: RoomIdDto,
      { dispatch, getState, extra: { services } },
    ): Promise<RoomIdDto> => {
      const { auth } = getState();
      const user = auth.user as UserDto;
      const { roomApi: roomApiService } = services;
      const { roomId } = payload;
      await roomApiService.addParticipant({ roomId });
      dispatch(this.addParticipant(user));
      return payload;
    },
  );

  public leaveRoom = createAsyncThunk(
    ActionType.LEAVE_ROOM,
    async (
      payload: RoomIdParticipantIdDto,
      { dispatch, extra: { services } },
    ): Promise<RoomIdDto> => {
      const { roomApi: roomApiService } = services;
      const { participantId, roomId } = payload;
      await roomApiService.removeParticipant(payload);
      dispatch(this.removeParticipant({ participantId }));
      return { roomId };
    },
  );

  public loadAvailableRooms = createAsyncThunk(
    ActionType.LOAD_AVAILABLE_ROOMS,
    async (_: undefined, { extra: { services } }): Promise<RoomDto[]> => {
      const { roomApi: roomApiService } = services;
      return roomApiService.getAllAvailable();
    },
  );

  public addRoomToAvailableRooms = createAction(
    ActionType.ADD_ROOM_TO_AVAILABLE_ROOMS,
    (payload: RoomDto) => ({ payload }),
  );

  public removeRoomFromAvailableRooms = createAction(
    ActionType.REMOVE_ROOM_FROM_AVAILABLE_ROOMS,
    (payload: RoomIdDto) => ({ payload }),
  );

  public createRoom = createAsyncThunk(
    ActionType.CREATE_ROOM,
    async (
      payload: CreateRoomRequestDto,
      { dispatch, extra: { services } },
    ): Promise<void> => {
      const { roomApi: roomApiService } = services;
      const { id } = await roomApiService.create(payload);
      void dispatch(this.loadShareRoomUrl({ roomId: id }));
    },
  );

  public loadShareRoomUrl = createAsyncThunk(
    ActionType.LOAD_SHARE_ROOM_URL,
    async (
      payload: RoomIdDto,
      { extra: { services } },
    ): Promise<ShareRoomUrlDto[ShareUrlKey.URL]> => {
      const { roomApi: roomApiService } = services;
      const { url } = await roomApiService.getShareUrl(payload);
      return url;
    },
  );

  public sendRoomUrlToEmails = createAsyncThunk(
    ActionType.SEND_ROOM_URL_TO_EMAILS,
    async (
      payload: SendRoomUrlToEmailsRequestDto,
      { extra: { services } },
    ): Promise<void> => {
      const { roomApi: roomApiService, notification: notificationService } =
        services;
      await roomApiService.sendShareUrlToEmails(payload);
      notificationService.info(NotificationMessage.SHARED_LINK_SENT);
    },
  );

  public resetShareRoomUrl = createAction(ActionType.RESET_SHARE_ROOM_URL);

  public addParticipant = createAction(
    ActionType.ADD_PARTICIPANT,
    (payload: Omit<UserDto, UserKey.EMAIL>) => ({
      payload: mapUserToParticipant(payload),
    }),
  );

  public removeParticipant = createAction(
    ActionType.REMOVE_PARTICIPANT,
    ({ participantId }: ParticipantIdDto) => ({ payload: participantId }),
  );

  public toggleParticipantIsReady = createAction(
    ActionType.TOGGLE_PARTICIPANT_IS_READY,
    ({ participantId }: ParticipantIdDto) => ({ payload: participantId }),
  );

  public increaseParticipantPosition = createAction(
    ActionType.INCREASE_PARTICIPANT_POSITION,
    ({ participantId }: ParticipantIdDto) => ({ payload: participantId }),
  );

  public setSpentTime = createAction(
    ActionType.SET_SPENT_TIME,
    (payload: Pick<Participant, CommonKey.ID | ParticipantKey.SPENT_TIME>) => ({
      payload,
    }),
  );

  public loadCommentatorText = createAsyncThunk(
    ActionType.SET_PERSONAL_ROOM_AS_CURRENT,
    async (
      payload: CommentatorEvent,
      { getState, extra: { services } },
    ): Promise<Pick<GameRoom, GameRoomKey.COMMENTATOR_TEXT> | undefined> => {
      const {
        racing: { currentRoom },
      } = getState();
      const { jokeApi: jokeApiService } = services;
      if (payload === CommentatorEvent.JOKE) {
        try {
          const { joke } = await jokeApiService.getRandom();
          return { commentatorText: joke };
        } catch {
          return;
        }
      }
      const commentatorText = getGameCommentatorText(
        payload,
        currentRoom?.participants,
      );
      return { commentatorText };
    },
  );

  public addLessonId = createAsyncThunk(
    ActionType.ADD_LESSON_ID,
    async (
      payload: RoomIdDto,
      { dispatch, extra: { services, actions } },
    ): Promise<RequiredLessonIdDto> => {
      const { roomApi: roomApiService } = services;
      const { lessons: lessonsActions } = actions;
      const { lessonId } = await roomApiService.addLessonId(payload);
      void dispatch(lessonsActions.loadCurrent({ lessonId }));
      return { lessonId };
    },
  );

  public removeLessonId = createAsyncThunk(
    ActionType.REMOVE_LESSON_ID,
    async (
      payload: RoomIdDto,
      { dispatch, extra: { services, actions } },
    ): Promise<void> => {
      const { roomApi: roomApiService } = services;
      const { lessons: lessonsActions } = actions;
      await roomApiService.removeLessonId(payload);
      void dispatch(lessonsActions.sendLessonResult());
      dispatch(lessonsActions.resetCurrent());
    },
  );

  public increaseCurrentParticipantPosition = createAction(
    ActionType.INCREASE_CURRENT_PARTICIPANT_POSITION,
    (payload: RoomIdParticipantIdDto) => ({ payload }),
  );

  public toggleCurrentParticipantIsReady = createAction(
    ActionType.TOGGLE_CURRENT_PARTICIPANT_IS_READY,
    (payload: RoomIdParticipantIdDto) => ({ payload }),
  );

  public resetAll = createAction(ActionType.RESET_ALL);

  public resetAllExceptPersonal = createAction(
    ActionType.RESET_ALL_EXCEPT_PERSONAL,
  );

  public resetCurrentRoomToDefault = createAsyncThunk(
    ActionType.RESET_CURRENT_ROOM_TO_DEFAULT,
    async (_: undefined, { getState }): Promise<void | GameRoom> => {
      const {
        racing: { currentRoom },
      } = getState();
      return currentRoom ? mapGameRoomToDefault(currentRoom) : undefined;
    },
  );

  public resetAvailableRooms = createAction(ActionType.RESET_AVAILABLE_ROOMS);
}

const racing = new Racing();

export { racing };
