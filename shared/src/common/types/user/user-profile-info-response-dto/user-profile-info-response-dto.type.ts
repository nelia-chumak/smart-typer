import { Rating, Statistics, UserDto } from 'common/types/types.js';

type UserProfileInfoResponseDto = UserDto & {
  statistics: Statistics;
  rating: Rating;
};

export type { UserProfileInfoResponseDto };
