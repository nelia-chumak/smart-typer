import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from 'common/constants/constants.js';
import { ValidationErrorMessage } from 'common/enums/enums.js';
import { yup } from 'dependencies/dependencies.js';
import { passwordRegex } from 'validation-schemas/regex/regex.js';

const passwordSchema = yup
  .string()
  .min(MIN_PASSWORD_LENGTH)
  .max(MAX_PASSWORD_LENGTH)
  .matches(passwordRegex, ValidationErrorMessage.PASSWORD_INCLUSIONS);

export { passwordSchema };
