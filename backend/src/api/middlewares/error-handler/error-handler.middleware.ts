import { HttpCode, HttpErrorMessage } from 'common/enums/enums';
import { ErrorResponse } from 'common/interfaces/interfaces';
import { HttpError } from 'exceptions/exceptions';
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { logger as loggerService } from 'services/services';

type Options = {
  loggerService: typeof loggerService;
};

const getErrorHandlerMiddleware = (opts: Options): ErrorRequestHandler => {
  const { loggerService } = opts;
  return (
    err: Error,
    _req: Request,
    res: Response,
    __next: NextFunction,
  ): void => {
    const isHttpError = err instanceof HttpError;

    const status = isHttpError ? err.status : HttpCode.INTERNAL_SERVER_ERROR;
    const message = isHttpError
      ? err.message
      : HttpErrorMessage.INTERNAL_SERVER_ERROR;

    loggerService.error({ status, message });
    loggerService.error(err.message);

    const errorResponse: ErrorResponse = {
      errorMessage: message,
      err,
    };

    res.status(status).json(errorResponse);
  };
};

export { getErrorHandlerMiddleware };
