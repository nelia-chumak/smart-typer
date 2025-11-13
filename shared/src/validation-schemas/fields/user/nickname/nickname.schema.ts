import {
  MAX_NICKNAME_LENGTH,
  MIN_NICKNAME_LENGTH,
} from 'common/constants/constants.js';
import { ValidationErrorMessage } from 'common/enums/enums.js';
import { yup } from 'dependencies/dependencies.js';
import { nicknameRegex } from 'validation-schemas/regex/regex.js';

const nicknameSchema = yup
  .string()
  .trim()
  .min(MIN_NICKNAME_LENGTH)
  .max(MAX_NICKNAME_LENGTH)
  .matches(nicknameRegex, ValidationErrorMessage.NICKNAME_INCLUSIONS);

export { nicknameSchema };
