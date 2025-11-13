import { UserKey } from 'common/enums/enums.js';
import { UserDto } from 'common/types/types.js';

type RoomDto = {
  id: number;
  lessonId: number | null;
  name: string;
  participants: Omit<UserDto, UserKey.EMAIL>[];
};

export type { RoomDto };
