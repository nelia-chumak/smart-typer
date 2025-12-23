import {
  getFileMiddleware,
  getValidationMiddleware,
} from 'api/middlewares/middlewares';
import { UserKey } from 'common/enums/enums';
import { IRequestWithUser } from 'common/interfaces/interfaces';
import {
  UpdateAvatarResponseDto,
  UserAuthInfoResponseDto,
  UserDto,
  UserProfileInfoResponseDto,
} from 'common/types/types';
import { Router } from 'express';
import { user as userService } from 'services/services';
import {
  getUserProfileInfoParamsSchema,
  updateUserPersonalInfoBodySchema,
} from 'validation-schemas/validation-schemas';
import { Abstract } from '../abstract/abstract.route';

type Constructor = {
  userService: typeof userService;
  getFileMiddleware: typeof getFileMiddleware;
  getValidationMiddleware: typeof getValidationMiddleware;
};

class User extends Abstract {
  private _userService: typeof userService;
  private _getFileMiddleware: typeof getFileMiddleware;
  private _getValidationMiddleware: typeof getValidationMiddleware;

  public constructor(params: Constructor) {
    super();
    this._userService = params.userService;
    this._getFileMiddleware = params.getFileMiddleware;
    this._getValidationMiddleware = params.getValidationMiddleware;
  }

  public getRoutes(): Router {
    const router: Router = Router();

    router.get(
      '/current',
      this._run<undefined, UserAuthInfoResponseDto, IRequestWithUser>((req) =>
        this._userService.getAuthInfo(req.userId),
      ),
    );

    router.get(
      '/:userId',
      this._getValidationMiddleware({ params: getUserProfileInfoParamsSchema }),
      this._run<undefined, UserProfileInfoResponseDto, IRequestWithUser>(
        (req) =>
          this._userService.getProfileInfo(
            Number(req.params.userId),
            req.userId,
          ),
      ),
    );

    router.put(
      '/current',
      this._getValidationMiddleware({ body: updateUserPersonalInfoBodySchema }),
      this._run<Partial<UserDto>, UserDto, IRequestWithUser>((req) =>
        this._userService.update(req.userId, req.body),
      ),
    );

    router.put(
      '/current/avatar',
      this._getFileMiddleware({ fileName: UserKey.PHOTO_URL }),
      this._run<undefined, UpdateAvatarResponseDto, IRequestWithUser>((req) =>
        this._userService.updateAvatar(req.userId, req.file),
      ),
    );

    router.delete(
      '/current/avatar',
      this._run<undefined, void, IRequestWithUser>((req) =>
        this._userService.deleteAvatar(req.userId),
      ),
    );

    return router;
  }
}

export { User };
