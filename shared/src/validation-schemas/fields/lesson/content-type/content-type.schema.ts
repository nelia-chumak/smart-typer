import { ContentType, ValidationErrorMessage } from 'common/enums/enums.js';
import { yup } from 'dependencies/dependencies.js';

const contentTypeSchema = yup
  .string()
  .trim()
  .oneOf(
    Object.values(ContentType),
    ValidationErrorMessage.INVALID_CONTENT_TYPE,
  );

export { contentTypeSchema };
