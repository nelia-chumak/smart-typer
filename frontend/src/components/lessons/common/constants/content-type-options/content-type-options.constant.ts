import { ContentType } from 'common/enums/enums';
import { IOption } from 'common/interfaces/interfaces';

const CONTENT_TYPE_OPTIONS: readonly IOption<ContentType>[] = [
  { value: null, label: 'All' },
  { value: ContentType.SYMBOLS, label: 'Symbols' },
  { value: ContentType.WORDS, label: 'Words' },
  { value: ContentType.SENTENCES, label: 'Sentences' },
] as const;

export { CONTENT_TYPE_OPTIONS };
