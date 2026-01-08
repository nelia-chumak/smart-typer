import { sharedLodash } from 'dependencies/dependencies';

export { hasErrorGivenHttpErrorMessage } from 'smart-typer-shared/helpers/helpers';
export * from './db/db';
export * from './file/file';
export * from './statistics/statistics';
export * from './study-plan/study-plan';
export const toSnakeCase = sharedLodash.snakeCase;
