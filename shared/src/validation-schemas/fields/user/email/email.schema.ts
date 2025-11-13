import { yup } from 'dependencies/dependencies.js';

const emailSchema = yup.string().email();

export { emailSchema };
