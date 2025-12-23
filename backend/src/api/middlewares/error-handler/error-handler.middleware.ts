import { NextFunction, Request, ErrorRequestHandler, Response } from 'express';
import { HttpCode, HttpErrorMessage } from 'common/enums/enums';
import { HttpError } from 'exceptions/exceptions';
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

    const status = isHttpError
      ? err.status
      : HttpCode.INTERNAL_SERVER_ERROR;
    const message = isHttpError
      ? err.message
      : HttpErrorMessage.INTERNAL_SERVER_ERROR;

    loggerService.error({ status, message });
    loggerService.error(err.message);

    res.status(status).send({ error: message });
  };
};

export { getErrorHandlerMiddleware };
