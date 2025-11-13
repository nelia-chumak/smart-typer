import { UserKey } from 'common/enums/enums';
import {
  UpdateAvatarResponseDto,
  UserDto,
  UserIdDto,
  UserProfileInfoResponseDto,
} from 'common/types/types';
import { createAction, createAsyncThunk } from 'store/external/external';
import { ActionType } from './action-type';

class Profile {
  public loadUser = createAsyncThunk(
    ActionType.LOAD_USER,
    async (
      payload: UserIdDto,
      { extra: { services } },
    ): Promise<UserProfileInfoResponseDto> => {
      const { userApi: userApiService } = services;
      return userApiService.getProfileInfo(payload);
    },
  );

  public resetAll = createAction(ActionType.RESET_ALL);

  public updateAvatar = createAsyncThunk(
    ActionType.UPDATE_AVATAR,
    async (
      payload: File,
      { dispatch, extra: { services, actions } },
    ): Promise<UpdateAvatarResponseDto[UserKey.PHOTO_URL]> => {
      const { userApi: userApiService } = services;
      const { photoUrl } = await userApiService.updateAvatar(payload);
      dispatch(actions.auth.updateUser({ photoUrl }));
      return photoUrl;
    },
  );

  public updatePersonalInfo = createAsyncThunk(
    ActionType.UPDATE_PERSONAL_INFO,
    async (
      payload: Partial<Pick<UserDto, UserKey.NICKNAME | UserKey.EMAIL>>,
      { dispatch, extra: { services, actions } },
    ): Promise<Partial<Pick<UserDto, UserKey.NICKNAME | UserKey.EMAIL>>> => {
      const { userApi: userApiService } = services;
      const { auth: authActions } = actions;
      await userApiService.updatePersonalInfo(payload);
      dispatch(authActions.updateUser(payload));
      return payload;
    },
  );

  public deleteAvatar = createAsyncThunk(
    ActionType.DELETE_AVATAR,
    async (
      _: undefined,
      { dispatch, extra: { services, actions } },
    ): Promise<void> => {
      const { userApi: userApiService } = services;
      await userApiService.deleteAvatar();
      dispatch(actions.auth.updateUser({ photoUrl: null }));
    },
  );
}

const profile = new Profile();

export { profile };
