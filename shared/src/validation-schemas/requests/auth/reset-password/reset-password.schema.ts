import { ValidationErrorMessage } from 'common/enums/enums.js';
import { yup } from 'dependencies/dependencies.js';
import { emailSchema } from 'validation-schemas/fields/fields.js';

const resetPasswordSchema = yup
  .object()
  .shape({
    email: emailSchema.required(),
  })
  .noUnknown(true, ValidationErrorMessage.INVALID_KEYS_RECEIVED);

export { resetPasswordSchema };
