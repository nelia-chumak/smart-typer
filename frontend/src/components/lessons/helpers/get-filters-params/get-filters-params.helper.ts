import { ContentType, CreatorType } from 'common/enums/enums';
import { IOption } from 'common/interfaces/interfaces';
import { LessonFilters } from 'common/types/types';

const getFiltersParams = (
  contentTypeFilter: IOption<ContentType>,
  creatorTypeFilter: IOption<CreatorType>,
): LessonFilters => {
  const params = {} as LessonFilters;

  if (contentTypeFilter.value) {
    params.contentType = contentTypeFilter.value as ContentType;
  }
  if (creatorTypeFilter.value) {
    params.creatorType = creatorTypeFilter.value as CreatorType;
  }
  return params;
};

export { getFiltersParams };
