import { getValidationMiddleware } from 'api/middlewares/middlewares';
import { IRequestWithUser } from 'common/interfaces/interfaces';
import {
  CreateRoomRequestDto,
  RequiredLessonIdDto,
  RoomDto,
  RoomIdDto,
  RoomIdParticipantIdDto,
  SendRoomUrlToEmailsRequestDto,
  ShareRoomUrlDto,
} from 'common/types/types';
import { Router } from 'express';
import { room as roomService } from 'services/services';
import {
  addRoomLessonIdParamsSchema,
  addRoomParticipantParamsSchema,
  createRoomBodySchema,
  getRoomParamsSchema,
  getRoomShareUrlParamsSchema,
  removeRoomLessonIdParamsSchema,
  removeRoomParticipantParamsSchema,
  sendShareRoomUrlBodySchema,
} from 'validation-schemas/validation-schemas';
import { Abstract } from '../abstract/abstract.route';

type Constructor = {
  roomService: typeof roomService;
  getValidationMiddleware: typeof getValidationMiddleware;
};

class Room extends Abstract {
  private _roomService: typeof roomService;
  private _getValidationMiddleware: typeof getValidationMiddleware;

  public constructor(params: Constructor) {
    super();
    this._roomService = params.roomService;
    this._getValidationMiddleware = params.getValidationMiddleware;
  }

  public getRoutes(): Router {
    const router: Router = Router();

    router.get(
      '/:roomId/share-url',
      this._getValidationMiddleware({ params: getRoomShareUrlParamsSchema }),
      this._run<RoomIdDto, ShareRoomUrlDto>((req) => {
        const roomId = Number(req.params.roomId);
        return this._roomService.getShareUrl(roomId);
      }),
    );

    router.post(
      '/share-url',
      this._getValidationMiddleware({ body: sendShareRoomUrlBodySchema }),
      this._run<SendRoomUrlToEmailsRequestDto, void, IRequestWithUser>((req) =>
        this._roomService.sendShareUrlToEmails(req.userId, req.body),
      ),
    );

    router.post(
      '/:roomId/participants',
      this._getValidationMiddleware({ params: addRoomParticipantParamsSchema }),
      this._run<RoomIdDto, void, IRequestWithUser>((req) => {
        const roomId = Number(req.params.roomId);
        return this._roomService.addParticipant(roomId, req.userId);
      }),
    );

    router.delete(
      '/:roomId/participants',
      this._getValidationMiddleware({
        params: removeRoomParticipantParamsSchema,
      }),
      this._run<RoomIdParticipantIdDto, void, IRequestWithUser>((req) => {
        const roomId = Number(req.params.roomId);
        return this._roomService.removeParticipant(roomId, req.userId);
      }),
    );

    router.post(
      '/:roomId/lesson',
      this._getValidationMiddleware({ params: addRoomLessonIdParamsSchema }),
      this._run<RoomIdDto, RequiredLessonIdDto>((req) => {
        const roomId = Number(req.params.roomId);
        return this._roomService.addLessonId(roomId);
      }),
    );

    router.delete(
      '/:roomId/lesson',
      this._getValidationMiddleware({ params: removeRoomLessonIdParamsSchema }),
      this._run<RoomIdDto, void>((req) => {
        const roomId = Number(req.params.roomId);
        return this._roomService.removeLessonId(roomId);
      }),
    );

    router.get(
      '/:roomId',
      this._getValidationMiddleware({ params: getRoomParamsSchema }),
      this._run<RoomIdDto, RoomDto>((req) => {
        const roomId = Number(req.params.roomId);
        return this._roomService.get(roomId);
      }),
    );

    router.get(
      '/',
      this._run<undefined, RoomDto[]>(() =>
        this._roomService.getAllAvailable(),
      ),
    );

    router.post(
      '/',
      this._getValidationMiddleware({ body: createRoomBodySchema }),
      this._run<CreateRoomRequestDto, RoomDto>((req) =>
        this._roomService.create(req.body),
      ),
    );

    return router;
  }
}

export { Room };
