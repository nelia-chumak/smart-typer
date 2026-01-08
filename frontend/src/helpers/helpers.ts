import { sharedLodash } from 'dependencies/dependencies';

const { isEqual, isNull, omit, omitBy } = sharedLodash;

export * from './exception/exception';
export * from './file/file';
export * from './lesson/lesson';
export * from './racing/racing';
export * from './route/route';
export * from './ui/ui';

export const lodash = { isEqual, isNull, omit, omitBy };
