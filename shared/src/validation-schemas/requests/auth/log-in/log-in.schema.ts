import { ValidationErrorMessage } from 'common/enums/enums.js';
import { yup } from 'dependencies/dependencies.js';
import {
  emailSchema,
  passwordSchema,
} from 'validation-schemas/fields/fields.js';

const logInSchema = yup
  .object()
  .shape({
    email: emailSchema.required(),
    password: passwordSchema.required(),
  })
  .noUnknown(true, ValidationErrorMessage.INVALID_KEYS_RECEIVED);

export { logInSchema };
