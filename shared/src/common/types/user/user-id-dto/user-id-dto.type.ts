import { CommonKey } from 'common/enums/enums.js';
import { UserDto } from 'common/types/types.js';

type UserIdDto = {
  userId: UserDto[CommonKey.ID];
};

export type { UserIdDto };
