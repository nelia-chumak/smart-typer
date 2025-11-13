import { Router } from 'express';
import {
  getValidationMiddleware,
  getAuthMiddleware,
  getErrorHandlerMiddleware,
  getFileMiddleware,
} from 'api/middlewares/middlewares';
import { getRoutes } from 'api/routes/routes';
import {
  auth as authService,
  token as tokenService,
  user as userService,
  settings as settingsService,
  room as roomService,
  logger as loggerService,
  lesson as lessonService,
  joke as jokeService,
} from 'services/services';
import { ENV } from 'common/constants/constants';

const router: Router = Router();

router.use(
  ENV.APP.API_PREFIX,
  getAuthMiddleware({ tokenService }),
  getRoutes({
    getFileMiddleware,
    getValidationMiddleware,
    authService,
    tokenService,
    userService,
    settingsService,
    roomService,
    loggerService,
    lessonService,
    jokeService,
  }),
);

router.use(getErrorHandlerMiddleware({ loggerService }));

export { router };
