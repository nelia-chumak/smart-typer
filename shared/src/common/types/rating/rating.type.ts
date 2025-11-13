import { CommonKey, StatisticsKey, UserKey } from 'common/enums/enums.js';
import { Statistics, UserDto } from 'common/types/types.js';

type Rating = (Pick<
  UserDto,
  UserKey.NICKNAME | UserKey.PHOTO_URL | CommonKey.ID
> &
  Pick<Statistics, StatisticsKey.AVERAGE_SPEED>)[];

export type { Rating };
