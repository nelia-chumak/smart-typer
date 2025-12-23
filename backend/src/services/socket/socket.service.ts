import { SocketErrorMessage, SocketEvent } from 'common/enums/enums';
import { RoomIdDto, RoomIdParticipantIdDto } from 'common/types/types';
import { Socket as SocketIo, Server } from 'socket.io';

class Socket {
  private _io: Server | null = null;

  public constructor() {
    this.initHandlers = this.initHandlers.bind(this);
  }

  public get io(): Server {
    if (!this._io) {
      throw new Error(SocketErrorMessage.NO_SOCKET_SERVICE_PROVIDED);
    }
    return this._io;
  }

  public initIo(io: Server): void {
    this._io = io;
  }

  public initHandlers(socket: SocketIo): void {
    if (!this._io) {
      throw new Error(SocketErrorMessage.NO_SOCKET_SERVICE_PROVIDED);
    }
    const io = this._io;

    socket.on(SocketEvent.JOIN_ROOM, async ({ roomId }: RoomIdDto) => {
      await socket.join(String(roomId));
    });

    socket.on(SocketEvent.LEAVE_ROOM, async ({ roomId }: RoomIdDto) => {
      await socket.leave(String(roomId));
    });

    socket.on(
      SocketEvent.TOGGLE_CURRENT_PARTICIPANT_IS_READY,
      async ({ roomId, participantId }: RoomIdParticipantIdDto) => {
        io.to(String(roomId)).emit(SocketEvent.TOGGLE_PARTICIPANT_IS_READY, {
          participantId,
        });
      },
    );

    socket.on(
      SocketEvent.INCREASE_CURRENT_PARTICIPANT_POSITION,
      async ({ participantId, roomId }: RoomIdParticipantIdDto) => {
        io.to(String(roomId)).emit(SocketEvent.INCREASE_PARTICIPANT_POSITION, {
          participantId,
        });
      },
    );
  }
}
export { Socket };
