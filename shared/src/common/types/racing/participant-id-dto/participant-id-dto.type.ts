import { CommonKey } from 'common/enums/enums.js';
import { UserDto } from 'common/types/types.js';

type ParticipantIdDto = {
  participantId: UserDto[CommonKey.ID];
};

export type { ParticipantIdDto };
