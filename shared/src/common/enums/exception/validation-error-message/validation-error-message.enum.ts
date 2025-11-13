enum ValidationErrorMessage {
  INVALID_KEYS_RECEIVED = 'Invalid keys received',
  NICKNAME_INCLUSIONS = 'nickname must consist of latin or cyrillic letters (upper and lower case), numbers, and symbols',
  PASSWORD_INCLUSIONS = 'password must consist of latin or cyrillic letters (upper and lower case), numbers, and symbols',
  PASSWORDS_MUST_MATCH = 'passwords must match',
  INVALID_FILE_SIZE = 'File must be less than 5 Mb.',
  FORBIDDEN_FILE_TYPE = 'Forbidden file type. Please choose image with type .png, .jpg or .jpeg',
  INVALID_LESSON_NAME = 'lesson\'s name must not include \'System Test Lesson\' ',
  INVALID_CONTENT_TYPE = 'lesson\'s content type must be one of: symbols, words, sentences',
}

export { ValidationErrorMessage };
