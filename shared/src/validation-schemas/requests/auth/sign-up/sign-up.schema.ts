import { ValidationErrorMessage } from 'common/enums/enums.js';
import { yup } from 'dependencies/dependencies.js';
import {
  emailSchema,
  nicknameSchema,
  passwordSchema,
} from 'validation-schemas/fields/fields.js';

const signUpSchema = yup
  .object()
  .shape({
    nickname: nicknameSchema.required(),
    email: emailSchema.required(),
    password: passwordSchema.required(),
  })
  .noUnknown(true, ValidationErrorMessage.INVALID_KEYS_RECEIVED);

export { signUpSchema };
