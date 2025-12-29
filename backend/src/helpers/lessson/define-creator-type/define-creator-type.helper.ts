import { CommonKey, CreatorType, LessonKey } from 'common/enums/enums';
import { ILessonRecord } from 'common/interfaces/interfaces';
import { UserDto } from 'common/types/types';

type DefineCreatorType = {
  userId: UserDto[CommonKey.ID];
  creatorId: ILessonRecord[LessonKey.CREATOR_ID];
};

const defineCreatorType = ({
  userId,
  creatorId,
}: DefineCreatorType): CreatorType => {
  const creatorType =
    userId === creatorId
      ? CreatorType.CURRENT_USER
      : creatorId
        ? CreatorType.OTHER_USERS
        : CreatorType.SYSTEM;

  return creatorType;
};

export { defineCreatorType };
