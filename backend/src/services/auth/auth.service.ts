import { CommonKey, HttpCode, HttpErrorMessage } from 'common/enums/enums';
import {
  GoogleLogInCodeRequestDto,
  GoogleLogInUrlResponseDto,
  GoogleUser,
  LogInRequestDto,
  RegisterRequestDto,
  ResetPasswordRequestDto,
  SetPasswordRequestDto,
  UserAuthInfoResponseDto,
  UserDto,
} from 'common/types/types';
import { HttpError } from 'exceptions/exceptions';
import { hasErrorGivenHttpErrorMessage } from 'helpers/helpers';
import {
  hash as hashService,
  mailer as mailerService,
  oauth2 as oauth2Service,
  token as tokenService,
  user as userService,
} from 'services/services';

type Constructor = {
  userService: typeof userService;
  hashService: typeof hashService;
  tokenService: typeof tokenService;
  mailerService: typeof mailerService;
  oauth2Service: typeof oauth2Service;
  appUrl: string;
};

class Auth {
  private _userService: typeof userService;
  private _hashService: typeof hashService;
  private _tokenService: typeof tokenService;
  private _mailerService: typeof mailerService;
  private _oauth2Service: typeof oauth2Service;
  private _appUrl: string;

  public constructor(params: Constructor) {
    this._userService = params.userService;
    this._hashService = params.hashService;
    this._tokenService = params.tokenService;
    this._mailerService = params.mailerService;
    this._oauth2Service = params.oauth2Service;
    this._appUrl = params.appUrl;
  }

  public async register(
    payload: RegisterRequestDto,
  ): Promise<UserAuthInfoResponseDto> {
    try {
      await this._userService.getByEmail(payload.email);

      throw new HttpError({
        status: HttpCode.CONFLICT,
        message: HttpErrorMessage.EMAIL_ALREADY_EXISTS,
      });
    } catch (error) {
      if (
        hasErrorGivenHttpErrorMessage(error, HttpErrorMessage.NO_SUCH_EMAIL)
      ) {
        const hashedPassword = await this._hashService.hash(payload.password);

        const newUser = await this._userService.create({
          ...payload,
          password: hashedPassword,
        });

        return this._userService.getAuthInfoByEmail(newUser.email);
      } else {
        throw error;
      }
    }
  }

  public async logIn(
    payload: LogInRequestDto,
  ): Promise<UserAuthInfoResponseDto> {
    try {
      const user = await this._userService.getByEmail(payload.email);

      const isPasswordCorrect = await this._hashService.verify(
        payload.password,
        user.password ?? '',
      );
      if (!isPasswordCorrect) {
        throw new HttpError({
          status: HttpCode.BAD_REQUEST,
          message: HttpErrorMessage.INVALID_LOG_IN_DATA,
        });
      }

      return this._userService.getAuthInfoByEmail(user.email);
    } catch (error) {
      if (
        hasErrorGivenHttpErrorMessage(error, HttpErrorMessage.NO_SUCH_EMAIL)
      ) {
        throw new HttpError({
          status: HttpCode.CONFLICT,
          message: HttpErrorMessage.INVALID_LOG_IN_DATA,
        });
      } else {
        throw error;
      }
    }
  }

  public async resetPassword(payload: ResetPasswordRequestDto): Promise<void> {
    try {
      const user = await this._userService.getByEmail(payload.email);

      const { accessToken } = this._tokenService.generateTokens(user.id);
      const url = `${this._appUrl}/set-password?token=${accessToken}`;
      await this._mailerService.sendMail({
        to: user.email,
        subject: 'Reset Password',
        text: url,
      });
    } catch (error) {
      if (
        hasErrorGivenHttpErrorMessage(error, HttpErrorMessage.NO_SUCH_EMAIL)
      ) {
        throw new HttpError({
          status: HttpCode.CONFLICT,
          message: HttpErrorMessage.NO_SUCH_EMAIL,
        });
      } else {
        throw error;
      }
    }
  }

  public async setPassword(
    payload: SetPasswordRequestDto,
  ): Promise<UserAuthInfoResponseDto> {
    const { token, password } = payload;
    if (!token) {
      throw new HttpError({
        status: HttpCode.BAD_REQUEST,
        message: HttpErrorMessage.INVALID_TOKEN,
      });
    }

    const { userId } = this._tokenService.verifyToken(token);

    const hashedPassword = await this._hashService.hash(password);
    const user = await this._userService.updatePassword(userId, {
      password: hashedPassword,
    });
    return this._userService.getAuthInfoByEmail(user.email);
  }

  public async logOut(userId: UserDto[CommonKey.ID]): Promise<void> {
    await this._tokenService.removeRefreshToken(userId);
  }

  public async getLogInGoogleUrl(): Promise<GoogleLogInUrlResponseDto> {
    const url = this._oauth2Service.generateAuthUrl();
    return { url };
  }

  public async logInGoogle({
    code,
  }: GoogleLogInCodeRequestDto): Promise<UserAuthInfoResponseDto> {
    const idToken = await this._oauth2Service.getIdToken(code);
    if (!idToken) {
      throw new HttpError({
        status: HttpCode.UNAUTHORIZED,
        message: HttpErrorMessage.UNAUTHORIZED,
      });
    }

    const decodedToken = this._tokenService.decodeToken(idToken);
    const { email, name, picture } = decodedToken as unknown as GoogleUser;

    try {
      const user = await this._userService.getAuthInfoByEmail(email);
      return user;
    } catch (error) {
      if (
        hasErrorGivenHttpErrorMessage(error, HttpErrorMessage.NO_SUCH_EMAIL)
      ) {
        const newUser = await this._userService.create({
          nickname: name,
          email,
          photoUrl: picture,
        });

        return this._userService.getAuthInfoByEmail(newUser.email);
      } else {
        throw error;
      }
    }
  }
}

export { Auth };
