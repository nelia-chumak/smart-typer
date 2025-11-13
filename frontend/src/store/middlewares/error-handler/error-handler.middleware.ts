import { isRejected, isRejectedWithValue } from '@reduxjs/toolkit';
import { HttpErrorMessage, ValidationErrorMessage } from 'common/enums/enums';
import { Middleware } from 'common/types/types';
import { notification as notificationService } from 'services/services';

type Options = {
  notificationService: typeof notificationService;
};

const getErrorHandlerMiddleware = ({
  notificationService,
}: Options): Middleware => {
  return () => (next) => (action) => {
    if (isRejected(action)) {
      const message = action.error?.message;
      if (message) notificationService.error(message as HttpErrorMessage | ValidationErrorMessage);
    }

    if (isRejectedWithValue(action)) {
      const payload: unknown = action.payload;
      const message =
        (payload as { message?: string })?.message ?? String(payload);
      if (message) notificationService.error(message as HttpErrorMessage | ValidationErrorMessage);
    }

    return next(action);
  };
};
export { getErrorHandlerMiddleware };
