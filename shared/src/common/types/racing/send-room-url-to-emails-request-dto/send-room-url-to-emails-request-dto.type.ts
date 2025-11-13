import { ShareUrlKey } from 'common/enums/enums.js';
import { ShareRoomUrlDto } from '../racing.js';

type SendRoomUrlToEmailsRequestDto = {
  emails: string[];
  url: ShareRoomUrlDto[ShareUrlKey.URL];
};

export type { SendRoomUrlToEmailsRequestDto };
