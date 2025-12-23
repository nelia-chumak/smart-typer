import { getValidationMiddleware } from 'api/middlewares/middlewares';
import { ContentType, CreatorType } from 'common/enums/enums';
import {
  IPaginationResponse,
  IRequestWithUser,
} from 'common/interfaces/interfaces';
import {
  CreateLessonRequestDto,
  LessonDto,
  LessonResponseDto,
  SkillsStatisticsDto,
} from 'common/types/types';
import { Router } from 'express';
import { lesson as lessonService } from 'services/services';
import {
  createLessonBodySchema,
  deleteLessonParamsSchema,
  getLessonParamsSchema,
  getMoreLessonsQuerySchema,
  handleLessonResultBodySchema,
  handleLessonResultParamsSchema,
} from 'validation-schemas/validation-schemas';
import { Abstract } from '../abstract/abstract.route';

type Constructor = {
  lessonService: typeof lessonService;
  getValidationMiddleware: typeof getValidationMiddleware;
};

class Lesson extends Abstract {
  private _lessonService: typeof lessonService;
  private _getValidationMiddleware: typeof getValidationMiddleware;

  public constructor(params: Constructor) {
    super();
    this._lessonService = params.lessonService;
    this._getValidationMiddleware = params.getValidationMiddleware;
  }

  public getRoutes(): Router {
    const router: Router = Router();

    router.post(
      '/',
      this._getValidationMiddleware({ body: createLessonBodySchema }),
      this._run<CreateLessonRequestDto, LessonResponseDto, IRequestWithUser>(
        (req) => this._lessonService.create(req.userId, req.body),
      ),
    );

    router.get(
      '/study-plan',
      this._run<undefined, LessonDto[], IRequestWithUser>((req) => {
        return this._lessonService.getStudyPlan(req.userId);
      }),
    );

    router.post(
      '/:lessonId/result',
      this._getValidationMiddleware({
        params: handleLessonResultParamsSchema,
        body: handleLessonResultBodySchema,
      }),
      this._run<SkillsStatisticsDto, void, IRequestWithUser>((req) => {
        const lessonId = Number(req.params.lessonId);
        return this._lessonService.handleResult(req.userId, lessonId, req.body);
      }),
    );

    router.get(
      '/:lessonId',
      this._getValidationMiddleware({ params: getLessonParamsSchema }),
      this._run<unknown, LessonResponseDto>((req) => {
        const lessonId = Number(req.params.lessonId);
        return this._lessonService.get(lessonId);
      }),
    );

    router.delete(
      '/:lessonId',
      this._getValidationMiddleware({ params: deleteLessonParamsSchema }),
      this._run<unknown, void, IRequestWithUser>((req) => {
        const lessonId = Number(req.params.lessonId);
        return this._lessonService.delete(req.userId, lessonId);
      }),
    );

    router.get(
      '/',
      this._getValidationMiddleware({ query: getMoreLessonsQuerySchema }),
      this._run<unknown, IPaginationResponse<LessonDto>, IRequestWithUser>(
        (req) => {
          const { offset, limit, contentType, creatorType } = req.query;
          const payload = {
            offset: Number(offset),
            limit: Number(limit),
            contentType: contentType ? (contentType as ContentType) : undefined,
            creatorType: creatorType ? (creatorType as CreatorType) : undefined,
          };
          return this._lessonService.getMore(req.userId, payload);
        },
      ),
    );

    return router;
  }
}

export { Lesson };
