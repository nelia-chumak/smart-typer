import { ContentType, CreatorType } from 'common/enums/enums';
import { IOption } from 'common/interfaces/interfaces';
import { LessonFilters } from 'common/types/types';

const getFiltersParams = (
  contentTypeFilter: IOption<ContentType>,
  creatorTypeFilter: IOption<CreatorType>,
): LessonFilters => {
  const params = {} as LessonFilters;

  if (contentTypeFilter.value) {
    params.contentType = contentTypeFilter.value;
  }
  if (creatorTypeFilter.value) {
    params.creatorType = creatorTypeFilter.value;
  }
  return params;
};

export { getFiltersParams };
