import {
  MILLISECONDS_IN_SECOND,
  SECONDS_IN_MINUTE,
} from 'common/constants/constants';
import { Participant, Rating } from 'common/types/types';

const mapParticipantsToRating = (participants: Participant[]): Rating => {
  return participants
    .map(({ id, nickname, photoUrl, position, spentTime }) => {
      const safeTime = Math.max(spentTime, 1000);
      const minutes = safeTime / MILLISECONDS_IN_SECOND / SECONDS_IN_MINUTE;

      return {
        id,
        nickname,
        photoUrl,
        averageSpeed: Math.round(position / minutes),
      };
    })
    .sort(
      (firstParticipant, secondParticipant) =>
        secondParticipant.averageSpeed - firstParticipant.averageSpeed,
    );
};

export { mapParticipantsToRating };
