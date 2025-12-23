import { HttpCode } from 'common/enums/enums';
import { NextFunction, Request, RequestHandler, Response } from 'express';

type RequestWithBody<TBody, TRequest> = Omit<
  TRequest,
  'body'
> & {
  body: TBody;
};

abstract class Abstract {
  protected _run = <
    TBody = unknown,
    TResult = unknown,
    TRequest extends Request = Request,
  >(
    method: (req: RequestWithBody<TBody, TRequest>) => Promise<TResult>,
  ): RequestHandler => {
    return async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> => {
      try {
        const result = await method(req as RequestWithBody<TBody, TRequest>);

        if (res.headersSent) {
          return;
        }

        if (result === undefined || result === null) {
          res.sendStatus(HttpCode.NO_CONTENT);
          return;
        }

        res.send(result);
      } catch (error) {
        next(error);
      }
    };
  };
}

export { Abstract };
