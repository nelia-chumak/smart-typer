import { getValidationMiddleware } from 'api/middlewares/middlewares';
import { IRequestWithUser } from 'common/interfaces/interfaces';
import {
  GoogleLogInCodeRequestDto,
  GoogleLogInUrlResponseDto,
  LogInRequestDto,
  RefreshTokenRequestDto,
  RegisterRequestDto,
  ResetPasswordRequestDto,
  SetPasswordRequestDto,
  TokensResponseDto,
  UserAuthInfoResponseDto,
} from 'common/types/types';
import { Router } from 'express';
import { auth as authService, token as tokenService } from 'services/services';
import {
  logInBodySchema,
  logInGoogleBodySchema,
  refreshTokensBodySchema,
  resetPasswordBodySchema,
  setPasswordBodySchema,
  signUpBodySchema,
} from 'validation-schemas/validation-schemas';
import { Abstract } from '../abstract/abstract.route';

type Constructor = {
  authService: typeof authService;
  tokenService: typeof tokenService;
  getValidationMiddleware: typeof getValidationMiddleware;
};

class Auth extends Abstract {
  private _authService: typeof authService;
  private _tokenService: typeof tokenService;
  private _getValidationMiddleware: typeof getValidationMiddleware;

  public constructor(params: Constructor) {
    super();
    this._authService = params.authService;
    this._tokenService = params.tokenService;
    this._getValidationMiddleware = params.getValidationMiddleware;
  }

  public getRoutes(): Router {
    const router: Router = Router();

    router.post(
      '/register',
      this._getValidationMiddleware({ body: signUpBodySchema }),
      this._run<RegisterRequestDto, UserAuthInfoResponseDto>((req) =>
        this._authService.register(req.body),
      ),
    );

    router.post(
      '/log-in',
      this._getValidationMiddleware({ body: logInBodySchema }),
      this._run<LogInRequestDto, UserAuthInfoResponseDto>((req) =>
        this._authService.logIn(req.body),
      ),
    );

    router.post(
      '/reset-password',
      this._getValidationMiddleware({ body: resetPasswordBodySchema }),
      this._run<ResetPasswordRequestDto, void>((req) =>
        this._authService.resetPassword(req.body),
      ),
    );

    router.post(
      '/set-password',
      this._getValidationMiddleware({ body: setPasswordBodySchema }),
      this._run<SetPasswordRequestDto, UserAuthInfoResponseDto>((req) =>
        this._authService.setPassword(req.body),
      ),
    );

    router.post(
      '/refresh',
      this._getValidationMiddleware({ body: refreshTokensBodySchema }),
      this._run<RefreshTokenRequestDto, TokensResponseDto>((req) =>
        this._tokenService.refreshTokens(req.body),
      ),
    );

    router.post(
      '/log-out',
      this._run<unknown, void, IRequestWithUser>((req) =>
        this._authService.logOut(req.userId),
      ),
    );

    router.post(
      '/log-in/google',
      this._getValidationMiddleware({ body: logInGoogleBodySchema }),
      this._run<GoogleLogInCodeRequestDto, UserAuthInfoResponseDto>((req) =>
        this._authService.logInGoogle(req.body),
      ),
    );

    router.get(
      '/log-in/google',
      this._run<undefined, GoogleLogInUrlResponseDto>(() =>
        this._authService.getLogInGoogleUrl(),
      ),
    );

    return router;
  }
}

export { Auth };
