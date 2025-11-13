import { UserKey } from 'common/enums/enums.js';
import { UserDto } from 'common/types/types.js';

type UpdateAvatarResponseDto = Pick<UserDto, UserKey.PHOTO_URL>;

export type { UpdateAvatarResponseDto };
