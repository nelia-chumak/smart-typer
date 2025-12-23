import { HttpErrorMessage } from 'common/enums/enums.js';
import { HttpError } from 'exceptions/exceptions.js';

const httpErrorMessagesSet = new Set<HttpErrorMessage>(
  Object.values(HttpErrorMessage) as HttpErrorMessage[],
);

const hasErrorGivenHttpErrorMessage = (
  error: unknown,
  message: HttpErrorMessage,
): boolean => {
  if (!(error instanceof HttpError)) {
    return false;
  }

  const errorMessage = error.message as HttpErrorMessage;
  return Boolean(
    httpErrorMessagesSet.has(errorMessage) && errorMessage === message,
  );
};

export { hasErrorGivenHttpErrorMessage };
