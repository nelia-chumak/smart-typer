import { JokeDto } from 'common/types/types';
import { Router } from 'express';
import { joke as jokeService } from 'services/services';
import { Abstract } from '../abstract/abstract.route';

type Constructor = {
  jokeService: typeof jokeService;
};

class Joke extends Abstract {
  private _jokeService: typeof jokeService;

  public constructor(params: Constructor) {
    super();
    this._jokeService = params.jokeService;
  }

  public getRoutes(): Router {
    const router: Router = Router();

    router.get(
      '/random',
      this._run<undefined, JokeDto>(() => this._jokeService.getRandom()),
    );

    return router;
  }
}

export { Joke };
