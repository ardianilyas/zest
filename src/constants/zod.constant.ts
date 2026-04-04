// ZOD VALIDATION
export const PASSWORD_MINIMAL_LENGTH = 8;

export const ZOD_ERROR_MESSAGE = {
  // Auth error messages
  EMAIL_INVALID: "Invalid email format",
  PASSWORD_REQUIRED: "Password is required",
  PASSWORD_INVALID: `Password must be at least ${PASSWORD_MINIMAL_LENGTH} characters long`,
  PASSWORD_MISMATCH: "Passwords do not match",

  // Category error messages
  CATEGORY_NAME_REQUIRED: "Category name is required",
} as const;