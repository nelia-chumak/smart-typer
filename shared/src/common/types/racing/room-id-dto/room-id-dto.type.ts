import { CommonKey } from 'common/enums/enums.js';
import { RoomDto } from 'common/types/types.js';

type RoomIdDto = {
  roomId: RoomDto[CommonKey.ID];
};

export type { RoomIdDto };
