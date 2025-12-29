import {
  CRON_JOB_RULE,
  ENV,
  MAX_USERS_IN_ROOM,
} from 'common/constants/constants';
import {
  CommonKey,
  HttpCode,
  HttpErrorMessage,
  SocketEvent,
  UserKey,
} from 'common/enums/enums';
import {
  CreateRoomRequestDto,
  RequiredLessonIdDto,
  RoomDto,
  SendRoomUrlToEmailsRequestDto,
  ShareRoomUrlDto,
  UserDto,
} from 'common/types/types';
import { room as roomRepository } from 'data/repositories/repositories';
import { HttpError } from 'exceptions/exceptions';
import {
  cron as cronService,
  lesson as lessonService,
  logger as loggerService,
  mailer as mailerService,
  socket as socketService,
  user as userService,
} from 'services/services';

type Constructor = {
  roomRepository: typeof roomRepository;
  socketService: typeof socketService;
  userService: typeof userService;
  mailerService: typeof mailerService;
  cronService: typeof cronService;
  lessonService: typeof lessonService;
  loggerService: typeof loggerService;
};

class Room {
  private _roomRepository: typeof roomRepository;
  private _socketService: typeof socketService;
  private _userService: typeof userService;
  private _lessonService: typeof lessonService;
  private _mailerService: typeof mailerService;
  private _cronService: typeof cronService;
  private _loggerService: typeof loggerService;

  public constructor(params: Constructor) {
    this._roomRepository = params.roomRepository;
    this._socketService = params.socketService;
    this._userService = params.userService;
    this._mailerService = params.mailerService;
    this._cronService = params.cronService;
    this._lessonService = params.lessonService;
    this._loggerService = params.loggerService;
    this._deleteUnused();
  }

  private _deleteUnused(): void {
    this._cronService.scheduleJob({
      rule: CRON_JOB_RULE,
      callback: () => {
        void this._roomRepository
          .deleteCreatedBeforeTodayWithoutParticipants()
          .catch((err: unknown) => {
            this._loggerService.error?.(
              err instanceof Error ? err.message : String(err),
            );
          });
      },
    });
  }

  public async get(roomId: RoomDto[CommonKey.ID]): Promise<RoomDto> {
    const room = await this._roomRepository.getById(roomId);

    if (!room) {
      throw new HttpError({
        status: HttpCode.NOT_FOUND,
        message: HttpErrorMessage.NO_ROOM_WITH_SUCH_ID,
      });
    }

    const participants = [] as Omit<UserDto, UserKey.EMAIL>[];
    for (const participant of room.participants) {
      const photoUrl = await this._userService.getSignedPhotoUrl(
        participant.photoUrl,
      );
      participants.push({ ...participant, photoUrl });
    }
    return { ...room, participants };
  }

  public async getAllAvailable(): Promise<RoomDto[]> {
    const availableRooms = await this._roomRepository.getAllAvailable();
    const availableRoomsWithParticipantsPhoto = [] as RoomDto[];
    for (const room of availableRooms) {
      const participants = [] as Omit<UserDto, UserKey.EMAIL>[];
      for (const participant of room.participants) {
        const photoUrl = await this._userService.getSignedPhotoUrl(
          participant.photoUrl,
        );
        participants.push({ ...participant, photoUrl });
      }
      availableRoomsWithParticipantsPhoto.push({ ...room, participants });
    }
    return availableRoomsWithParticipantsPhoto;
  }

  public async create(payload: CreateRoomRequestDto): Promise<RoomDto> {
    const createdRoom = await this._roomRepository.create(payload);

    if (!payload.isPrivate) {
      this._socketService.io.emit(SocketEvent.CREATE_ROOM, createdRoom);
    }
    return createdRoom;
  }

  public async getShareUrl(
    roomId: RoomDto[CommonKey.ID],
  ): Promise<ShareRoomUrlDto> {
    const room = await this._roomRepository.getById(roomId);
    if (!room) {
      throw new HttpError({
        status: HttpCode.NOT_FOUND,
        message: HttpErrorMessage.NO_ROOM_WITH_SUCH_ID,
      });
    }
    const url = `${ENV.APP.URL}/rooms/${roomId}`;
    return { url };
  }

  public async sendShareUrlToEmails(
    userId: UserDto[CommonKey.ID],
    payload: SendRoomUrlToEmailsRequestDto,
  ): Promise<void> {
    const user = await this._userService.get(userId);
    if (!user) {
      throw new HttpError({
        status: HttpCode.NOT_FOUND,
        message: HttpErrorMessage.NO_USER_WITH_SUCH_ID,
      });
    }
    const { emails, url } = payload;
    await this._mailerService.sendMail({
      to: emails,
      subject: `${user.nickname} shared an Key Racing room with you`,
      text: url,
    });
  }

  public async addParticipant(
    roomId: RoomDto[CommonKey.ID],
    userId: UserDto[CommonKey.ID],
  ): Promise<void> {
    const user = await this._userService.get(userId);
    const { currentRoomId } = await this._userService.getCurrentRoomId(userId);
    if (currentRoomId) {
      throw new HttpError({
        status: HttpCode.CONFLICT,
        message: HttpErrorMessage.USER_ALREADY_IN_ROOM,
      });
    }

    const { count: participantsCount, id: fetchedRoomId } =
      (await this._roomRepository.getByIdWithParticipantsCount(roomId)) ?? {};

    if (!fetchedRoomId) {
      throw new HttpError({
        status: HttpCode.NOT_FOUND,
        message: HttpErrorMessage.NO_ROOM_WITH_SUCH_ID,
      });
    } else if (participantsCount && participantsCount >= MAX_USERS_IN_ROOM) {
      throw new HttpError({
        status: HttpCode.BAD_REQUEST,
        message: HttpErrorMessage.MAX_COUNT_OF_USERS,
      });
    }

    const { userId: ownerId } =
      (await this._roomRepository.getOwnerIdByPersonalRoomId(roomId)) ?? {};

    if (userId !== ownerId && ownerId) {
      throw new HttpError({
        status: HttpCode.FORBIDDEN,
        message: HttpErrorMessage.JOIN_PERSONAL_ROOM,
      });
    }

    await this._userService.updateCurrentRoom(userId, roomId);

    const participant = {
      id: user.id,
      nickname: user.nickname,
      photoUrl: user.photoUrl,
    };
    this._socketService.io
      .to(String(roomId))
      .emit(SocketEvent.ADD_PARTICIPANT, participant);
  }

  public async removeParticipant(
    roomId: RoomDto[CommonKey.ID],
    userId: UserDto[CommonKey.ID],
  ): Promise<void> {
    const participant = await this._userService.get(userId);

    const { currentRoomId } = await this._userService.getCurrentRoomId(userId);
    if (currentRoomId !== roomId) {
      throw new HttpError({
        status: HttpCode.CONFLICT,
        message: HttpErrorMessage.USER_NOT_IN_ROOM,
      });
    }

    const { count: participantsCount, id: fetchedRoomId } =
      (await this._roomRepository.getByIdWithParticipantsCount(roomId)) ?? {};

    if (!fetchedRoomId) {
      throw new HttpError({
        status: HttpCode.NOT_FOUND,
        message: HttpErrorMessage.NO_ROOM_WITH_SUCH_ID,
      });
    }

    const { userId: ownerId } =
      (await this._roomRepository.getOwnerIdByPersonalRoomId(roomId)) ?? {};

    await this._userService.updateCurrentRoom(userId, null);

    this._socketService.io
      .to(String(roomId))
      .emit(SocketEvent.REMOVE_PARTICIPANT, { participantId: participant.id });

    if (participantsCount === 1 && !ownerId) {
      this._socketService.io.emit(SocketEvent.DELETE_ROOM, { roomId });
      await this._roomRepository.removeById(roomId);
    }
  }

  public async addLessonId(
    roomId: RoomDto[CommonKey.ID],
  ): Promise<RequiredLessonIdDto> {
    const room = await this._roomRepository.getById(roomId);
    if (!room) {
      throw new HttpError({
        status: HttpCode.NOT_FOUND,
        message: HttpErrorMessage.NO_ROOM_WITH_SUCH_ID,
      });
    }
    if (room.lessonId) {
      return { lessonId: room.lessonId };
    }

    const { lessonId } =
      await this._lessonService.getRandomSystemIdWithoutTest();

    return this._roomRepository.updateLessonId(roomId, lessonId);
  }

  public async removeLessonId(roomId: RoomDto[CommonKey.ID]): Promise<void> {
    const room = await this._roomRepository.getById(roomId);
    if (!room) {
      throw new HttpError({
        status: HttpCode.NOT_FOUND,
        message: HttpErrorMessage.NO_ROOM_WITH_SUCH_ID,
      });
    }
    if (!room.lessonId) {
      return;
    }

    await this._roomRepository.updateLessonId(roomId, null);
  }
}

export { Room };
