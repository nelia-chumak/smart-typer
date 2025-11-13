import { ContentType } from 'common/enums/enums.js';

const calculatePriorityCoefficient = (
  level: number,
  contentType: ContentType,
): number => {
  if (level <= 0.5) {
    switch (contentType) {
      case ContentType.SYMBOLS:
        return 3;
      case ContentType.WORDS:
        return 2;
      case ContentType.SENTENCES:
        return 1;
    }
  } else if (level <= 0.75) {
    switch (contentType) {
      case ContentType.SYMBOLS:
        return 1;
      case ContentType.WORDS:
        return 2;
      case ContentType.SENTENCES:
        return 1;
    }
  } else {
    switch (contentType) {
      case ContentType.SYMBOLS:
        return 1;
      case ContentType.WORDS:
        return 2;
      case ContentType.SENTENCES:
        return 3;
    }
  }
};

export { calculatePriorityCoefficient };
