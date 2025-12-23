import { getValidationMiddleware } from 'api/middlewares/middlewares';
import { IRequestWithUser } from 'common/interfaces/interfaces';
import { SettingsDto } from 'common/types/types';
import { Router } from 'express';
import { settings as settingsService } from 'services/services';
import { updateSettingsBodySchema } from 'validation-schemas/validation-schemas';
import { Abstract } from '../abstract/abstract.route';

type Constructor = {
  settingsService: typeof settingsService;
  getValidationMiddleware: typeof getValidationMiddleware;
};

class Settings extends Abstract {
  private _settingsService: typeof settingsService;
  private _getValidationMiddleware: typeof getValidationMiddleware;

  public constructor(params: Constructor) {
    super();
    this._settingsService = params.settingsService;
    this._getValidationMiddleware = params.getValidationMiddleware;
  }

  public getRoutes(): Router {
    const router: Router = Router();

    router.put(
      '/',
      this._getValidationMiddleware({ body: updateSettingsBodySchema }),
      this._run<Partial<SettingsDto>, SettingsDto, IRequestWithUser>((req) =>
        this._settingsService.updateByUserId(req.userId, req.body),
      ),
    );

    return router;
  }
}

export { Settings };
