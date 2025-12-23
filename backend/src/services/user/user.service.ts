import { basename } from 'path';
import {
  CommonKey,
  HttpCode,
  HttpErrorMessage,
  SkillKey,
  UserKey,
  UserToRoomKey,
  UserToSkillKey,
} from 'common/enums/enums';
import {
  UserDto,
  UserWithPassword,
  CreateUserRequestDto,
  UserAuthInfoResponseDto,
  UserProfileInfoResponseDto,
  UpdateAvatarResponseDto,
  UserToRoom,
  Skill,
  RoomDto,
  Rating,
} from 'common/types/types';
import { user as userRepository } from 'data/repositories/repositories';
import { HttpError } from 'exceptions/exceptions';
import { token as tokenService, s3 as s3Service } from 'services/services';
import { IUserToSkillRecord } from 'common/interfaces/interfaces';

type Constructor = {
  userRepository: typeof userRepository;
  tokenService: typeof tokenService;
  s3Service: typeof s3Service;
};

class User {
  private _userRepository: typeof userRepository;
  private _tokenService: typeof tokenService;
  private _s3Service: typeof s3Service;

  public constructor(params: Constructor) {
    this._userRepository = params.userRepository;
    this._tokenService = params.tokenService;
    this._s3Service = params.s3Service;
  }

  public async getSignedPhotoUrl(
    photoUrl: UserDto[UserKey.PHOTO_URL],
  ): Promise<UserDto[UserKey.PHOTO_URL]> {
    const isGoogleUrl = photoUrl?.match(/google/i);

    // prettier-ignore
    const signedPhotoUrl = !photoUrl
      ? null
      : isGoogleUrl
        ? photoUrl
        : await this._s3Service.getSignedUrl(photoUrl);

    return signedPhotoUrl;
  }

  public async getAuthInfoByEmail(
    email: UserDto[UserKey.EMAIL],
  ): Promise<UserAuthInfoResponseDto> {
    const user =
      await this._userRepository.getByEmailWithSettingsAndPersonalRoom(email);

    if (!user) {
      throw new HttpError({
        status: HttpCode.NOT_FOUND,
        message: HttpErrorMessage.NO_SUCH_EMAIL,
      });
    }
    const photoUrl = await this.getSignedPhotoUrl(user.photoUrl);
    const tokens = await this._tokenService.getTokens(user.id);
    return { ...user, ...tokens, photoUrl };
  }

  public async getAuthInfo(
    userId: UserDto[CommonKey.ID],
  ): Promise<UserAuthInfoResponseDto> {
    const user = await this._userRepository.getByIdWithSettingsAndPersonalRoom(
      userId,
    );
    if (!user) {
      throw new HttpError({
        status: HttpCode.NOT_FOUND,
        message: HttpErrorMessage.NO_USER_WITH_SUCH_ID,
      });
    }
    const photoUrl = await this.getSignedPhotoUrl(user.photoUrl);
    const tokens = await this._tokenService.getTokens(user.id);
    return { ...user, ...tokens, photoUrl };
  }

  public async getByEmail(
    email: UserDto[UserKey.EMAIL],
  ): Promise<UserWithPassword> {
    const user = await this._userRepository.getByEmail(email);
    if (!user) {
      throw new HttpError({
        status: HttpCode.NOT_FOUND,
        message: HttpErrorMessage.NO_SUCH_EMAIL,
      });
    }

    return user;
  }

  public create(payload: CreateUserRequestDto): Promise<UserWithPassword> {
    const { nickname, email, photoUrl, password } = payload;
    const userData = {
      email,
      nickname,
      password: password ?? null,
      photoUrl: photoUrl ?? null,
    };
    return this._userRepository.create(userData);
  }

  public async update(
    userId: UserDto[CommonKey.ID],
    payload: Partial<Pick<UserDto, UserKey.NICKNAME | UserKey.EMAIL>>,
  ): Promise<UserDto> {
    if (payload.email) {
      const userWithEmail = await this._userRepository.getByEmail(
        payload.email,
      );
      if (userWithEmail) {
        throw new HttpError({
          status: HttpCode.CONFLICT,
          message: HttpErrorMessage.EMAIL_ALREADY_EXISTS,
        });
      }
    }
    return this._userRepository.patchById(userId, payload);
  }

  public async updatePassword(
    userId: UserDto[CommonKey.ID],
    payload: Pick<UserWithPassword, UserKey.PASSWORD>,
  ): Promise<UserDto> {
    return this._userRepository.patchById(userId, payload);
  }

  public async getProfileInfo(
    userId: UserDto[CommonKey.ID],
    currentUserId: UserDto[CommonKey.ID],
  ): Promise<UserProfileInfoResponseDto> {
    const userWithStatistics = await this._userRepository.getByIdWithStatistics(
      userId,
    );
    if (!userWithStatistics) {
      throw new HttpError({
        status: HttpCode.NOT_FOUND,
        message: HttpErrorMessage.NO_USER_WITH_SUCH_ID,
      });
    }
    const rating = await this._userRepository.getRating(currentUserId);
    const ratingWithPhoto = [] as Rating;
    for (const participant of rating) {
      const photoUrl = await this.getSignedPhotoUrl(participant.photoUrl);
      ratingWithPhoto.push({ ...participant, photoUrl });
    }
    const photoUrl = await this.getSignedPhotoUrl(userWithStatistics.photoUrl);
    return {
      ...userWithStatistics,
      rating: ratingWithPhoto.sort((a, b) => b.averageSpeed - a.averageSpeed),
      photoUrl,
    };
  }

  public async get(
    userId: UserDto[CommonKey.ID],
  ): Promise<Omit<UserDto, UserKey.PASSWORD>> {
    const user = await this._userRepository.getById(userId);
    if (!user) {
      throw new HttpError({
        status: HttpCode.BAD_REQUEST,
        message: HttpErrorMessage.NO_USER_WITH_SUCH_ID,
      });
    }
    return user;
  }

  public async updateAvatar(
    userId: UserDto[CommonKey.ID],
    file?: Express.Multer.File,
  ): Promise<UpdateAvatarResponseDto> {
    if (!file) {
      throw new HttpError({
        status: HttpCode.UNPROCESSABLE_ENTITY,
        message: HttpErrorMessage.NO_FILE,
      });
    }

    const userToUpdate = await this.get(userId);
    if (!userToUpdate) {
      throw new HttpError({
        status: HttpCode.NOT_FOUND,
        message: HttpErrorMessage.NO_USER_WITH_SUCH_ID,
      });
    }

    const { photoUrl } = userToUpdate;
    if (photoUrl) {
      const fileName = basename(photoUrl);
      const isExistsAvatar = await this._s3Service.doesFileExistInS3(fileName);
      if (isExistsAvatar) {
        await this._s3Service.deleteInS3(fileName);
      }
    }

    const uploadedFile = await this._s3Service.uploadToS3(userId, file);
    const { Location: location } = uploadedFile;
    await this._userRepository.patchById(userId, {
      photoUrl: location,
    });

    const newPhotoUrl = await this._s3Service.getSignedUrl(location);
    return { photoUrl: newPhotoUrl };
  }

  public async deleteAvatar(userId: UserDto[CommonKey.ID]): Promise<void> {
    const userToUpdate = await this.get(userId);
    if (!userToUpdate) {
      throw new HttpError({
        status: HttpCode.NOT_FOUND,
        message: HttpErrorMessage.NO_USER_WITH_SUCH_ID,
      });
    }
    const { photoUrl } = userToUpdate;
    if (photoUrl) {
      const fileName = basename(photoUrl);
      const isExistsAvatar = await this._s3Service.doesFileExistInS3(fileName);
      if (isExistsAvatar) {
        await this._s3Service.deleteInS3(fileName);
      }
      await this._userRepository.patchById(userId, { photoUrl: null });
    }
  }

  public async updateCurrentRoom(
    userId: UserDto[CommonKey.ID],
    roomId: RoomDto[CommonKey.ID] | null,
  ): Promise<Omit<UserToRoom, UserToRoomKey.PERSONAL_ROOM_ID>> {
    return this._userRepository.updateCurrentRoomByUserId(userId, roomId);
  }

  public async getCurrentSkillLevels(
    userId: UserDto[CommonKey.ID],
  ): Promise<Omit<Skill, SkillKey.NAME>[]> {
    const currentSkillLevels =
      await this._userRepository.getCurrentSkillLevelsByUserId(userId);

    if (!currentSkillLevels) {
      throw new HttpError({
        status: HttpCode.NOT_FOUND,
        message: HttpErrorMessage.NO_USER_WITH_SUCH_ID,
      });
    }

    return currentSkillLevels;
  }

  public async updateSkillLevels(
    userId: UserDto[CommonKey.ID],
    payload: Omit<Skill, SkillKey.NAME>[],
  ): Promise<Omit<IUserToSkillRecord, UserToSkillKey.USER_ID>[]> {
    return this._userRepository.patchSkillLevelsByUserId(userId, payload);
  }

  public async getCurrentRoomId(
    userId: UserDto[CommonKey.ID],
  ): Promise<Pick<UserToRoom, UserToRoomKey.CURRENT_ROOM_ID>> {
    return this._userRepository.getCurrentRoomId(userId);
  }
}

export { User };
