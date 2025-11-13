import { CustomExceptionName, HttpCode } from 'common/enums/enums.js';
import { DEFAULT_MESSAGE } from './common/constants.js';

class HttpError extends Error {
  status: HttpCode;

  constructor({
    status = HttpCode.INTERNAL_SERVER_ERROR,
    message = DEFAULT_MESSAGE,
  } = {}) {
    super(message);
    this.status = status;
    this.name = CustomExceptionName.HTTP_ERROR;
  }
}

export { HttpError };
