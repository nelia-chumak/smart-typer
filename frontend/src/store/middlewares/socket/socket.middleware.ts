import { SocketEvent, UserKey } from 'common/enums/enums';
import {
  AppMiddleware,
  ParticipantIdDto,
  RoomDto,
  RoomIdDto,
  UserDto,
} from 'common/types/types';
import { socket as socketService } from 'services/services';
import { racing as racingActions } from 'store/modules/actions';

type Options = {
  socketService: typeof socketService;
  racingActions: typeof racingActions;
};

const getSocketMiddleware = ({ socketService }: Options): AppMiddleware => {
  return (api) => {
    const { dispatch } = api;
    const getState = api.getState.bind(api);

    socketService.on(SocketEvent.CREATE_ROOM, (payload: RoomDto) => {
      dispatch(racingActions.addRoomToAvailableRooms(payload));
    });

    socketService.on(
      SocketEvent.ADD_PARTICIPANT,
      (payload: Omit<UserDto, UserKey.EMAIL>) => {
        const currentUserId = getState().auth.user?.id;
        if (currentUserId !== payload.id) {
          dispatch(racingActions.addParticipant(payload));
        }
      },
    );

    socketService.on(
      SocketEvent.REMOVE_PARTICIPANT,
      (payload: ParticipantIdDto) => {
        const currentUserId = getState().auth.user?.id;
        if (currentUserId !== payload.participantId) {
          dispatch(racingActions.removeParticipant(payload));
        }
      },
    );

    socketService.on(SocketEvent.DELETE_ROOM, (payload: RoomIdDto) => {
      dispatch(racingActions.removeRoomFromAvailableRooms(payload));
    });

    socketService.on(
      SocketEvent.TOGGLE_PARTICIPANT_IS_READY,
      (payload: ParticipantIdDto) => {
        const currentUserId = getState().auth.user?.id;
        if (currentUserId !== payload.participantId) {
          dispatch(racingActions.toggleParticipantIsReady(payload));
        }
      },
    );

    socketService.on(
      SocketEvent.INCREASE_PARTICIPANT_POSITION,
      (payload: ParticipantIdDto) => {
        const currentUserId = getState().auth.user?.id;
        if (currentUserId !== payload.participantId) {
          dispatch(racingActions.increaseParticipantPosition(payload));
        }
      },
    );

    return (next) => (action) => {
      if (racingActions.joinRoom.fulfilled.match(action)) {
        socketService.emit(SocketEvent.JOIN_ROOM, action.payload);
      }
      if (racingActions.leaveRoom.fulfilled.match(action)) {
        socketService.emit(SocketEvent.LEAVE_ROOM, action.payload);
      }
      if (racingActions.increaseCurrentParticipantPosition.match(action)) {
        socketService.emit(
          SocketEvent.INCREASE_CURRENT_PARTICIPANT_POSITION,
          action.payload,
        );
      }
      if (racingActions.toggleCurrentParticipantIsReady.match(action)) {
        socketService.emit(
          SocketEvent.TOGGLE_CURRENT_PARTICIPANT_IS_READY,
          action.payload,
        );
      }
      return next(action);
    };
  };
};

export { getSocketMiddleware };
