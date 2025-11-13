import {
  RoomDto,
  SettingsDto,
  TokensResponseDto,
  UserDto,
} from 'common/types/types.js';

type UserAuthInfoResponseDto = UserDto &
  TokensResponseDto & {
    settings: SettingsDto;
    personalRoom: RoomDto;
  };

export type { UserAuthInfoResponseDto };
