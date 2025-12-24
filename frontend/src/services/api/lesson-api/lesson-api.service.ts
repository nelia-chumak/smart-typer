import { HttpMethod, RequestContentType } from 'common/enums/enums';
import {
  IPaginationRequest,
  IPaginationResponse,
} from 'common/interfaces/interfaces';
import {
  CreateLessonRequestDto,
  LessonDto,
  LessonFilters,
  LessonIdDto,
  LessonResponseDto,
  LessonResult,
} from 'common/types/types';
import { Http as HttpService } from '../../http/http.service';

type Constructor = {
  httpService: HttpService;
};

class LessonApi {
  private _httpService: HttpService;
  private _baseUrl = '/api/lessons';

  public constructor(params: Constructor) {
    this._httpService = params.httpService;
  }

  public async create(
    payload: CreateLessonRequestDto,
  ): Promise<LessonResponseDto> {
    return this._httpService.load(this._baseUrl, {
      method: HttpMethod.POST,
      payload: JSON.stringify(payload),
      contentType: RequestContentType.JSON,
    });
  }

  public async delete(payload: LessonIdDto): Promise<void> {
    const { lessonId } = payload;
    return this._httpService.load(`${this._baseUrl}/${lessonId}`, {
      method: HttpMethod.DELETE,
    });
  }

  public async get(payload: LessonIdDto): Promise<LessonResponseDto> {
    const { lessonId } = payload;
    return this._httpService.load(`${this._baseUrl}/${lessonId}`);
  }

  public async getMore(
    payload: IPaginationRequest & LessonFilters,
  ): Promise<IPaginationResponse<LessonDto>> {
    return this._httpService.load(this._baseUrl, {
      method: HttpMethod.GET,
      queryParams: payload,
    });
  }

  public async sendLessonResult(payload: LessonResult): Promise<void> {
    const { lessonId, ...skillsStatistics } = payload;
    return this._httpService.load(`${this._baseUrl}/${lessonId}/result`, {
      method: HttpMethod.POST,
      payload: JSON.stringify(skillsStatistics),
      contentType: RequestContentType.JSON,
    });
  }

  public async getStudyPlan(): Promise<LessonDto[]> {
    return this._httpService.load(`${this._baseUrl}/study-plan`);
  }
}

export { LessonApi };
