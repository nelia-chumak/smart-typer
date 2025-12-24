import { CreatorType } from 'common/enums/enums';
import { IOption } from 'common/interfaces/interfaces';

const CREATOR_TYPE_OPTIONS: readonly IOption<CreatorType>[] = [
  { value: null, label: 'All' },
  { value: CreatorType.CURRENT_USER, label: 'Me' },
  { value: CreatorType.OTHER_USERS, label: 'Users' },
  { value: CreatorType.SYSTEM, label: 'System' },
] as const;

export { CREATOR_TYPE_OPTIONS };
