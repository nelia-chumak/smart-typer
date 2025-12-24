import { WHITE_LIST_ROUTES } from 'common/constants/constants';
import { HttpCode, HttpErrorMessage } from 'common/enums/enums';
import { ErrorResponse } from 'common/interfaces/interfaces';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { token as tokenService } from 'services/services';

type Options = {
  tokenService: typeof tokenService;
};

const getAuthMiddleware = (opts: Options): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { tokenService } = opts;
    if (WHITE_LIST_ROUTES.includes(req.path)) {
      return next();
    }

    try {
      const authHeader = req.headers['authorization'];
      if (authHeader) {
        const token = authHeader && authHeader.split(' ')[1]; // remove Bearer part
        const decoded = tokenService.verifyToken(token);
        req.userId = decoded.userId;
        next();
      } else {
        throw new Error();
      }
    } catch (err) {
      const errorResponse: ErrorResponse = {
        errorMessage: HttpErrorMessage.UNAUTHORIZED,
        err,
      };
      res.status(HttpCode.UNAUTHORIZED).json(errorResponse);
    }
  };
};

export { getAuthMiddleware };
