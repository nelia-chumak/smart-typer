enum MulterErrorMessageByCode {
  LIMIT_PART_COUNT = "Too many parts in the multipart request.",
  LIMIT_FILE_SIZE = "File size exceeds the allowed limit.",
  LIMIT_FILE_COUNT = "Too many files uploaded.",
  LIMIT_FIELD_KEY = "Field name is too long.",
  LIMIT_FIELD_VALUE = "Field value is too long.",
  LIMIT_FIELD_COUNT = "Too many fields in the form.",
  LIMIT_UNEXPECTED_FILE = "Unexpected file or invalid field name.",
  MISSING_FIELD_NAME = "Missing field name for file upload."
}


export { MulterErrorMessageByCode };
