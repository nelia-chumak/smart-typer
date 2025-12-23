import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from 'common/constants/constants';
import {
  HttpCode,
  HttpErrorMessage,
  MulterErrorMessageByCode,
  ValidationErrorMessage,
} from 'common/enums/enums';
import { HttpError } from 'exceptions/exceptions';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { megabytesToBytes } from 'helpers/helpers';
import multer, { FileFilterCallback, MulterError } from 'multer';

type Options = {
  fileName: string;
};

const uploadToMemoryStorage = (fileName: string): RequestHandler => {
  const storage = multer.memoryStorage();

  const limits = {
    fileSize: megabytesToBytes(MAX_FILE_SIZE),
  };

  const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
  ): void => {
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      callback(null, true);
      return;
    }
    callback(
      new HttpError({
        status: HttpCode.BAD_REQUEST,
        message: ValidationErrorMessage.FORBIDDEN_FILE_TYPE,
      }),
    );
  };

  return multer({ fileFilter, storage, limits }).single(fileName);
};

const getErrorHandler = (next: NextFunction) => {
  return (error: unknown): void => {
    if (error instanceof MulterError) {
      throw new HttpError({
        status: HttpCode.BAD_REQUEST,
        message:
          MulterErrorMessageByCode[error.code] ?? 'Unknown file upload error.',
      });
    } else if (error) {
      throw new HttpError({
        status: HttpCode.INTERNAL_SERVER_ERROR,
        message: HttpErrorMessage.INTERNAL_SERVER_ERROR,
      });
    }
    next();
  };
};

const getFileMiddleware = (opts: Options): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    uploadToMemoryStorage(opts.fileName)(req, res, getErrorHandler(next));
  };
};

export { getFileMiddleware };
