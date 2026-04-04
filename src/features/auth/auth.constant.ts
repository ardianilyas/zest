// JWT
export const JWT_EXPIRES_IN = "3d";

// BCRYPT
export const BCRYPT_SALT_ROUNDS = 10;

// COOKIE
export const COOKIE_NAME = "access_token";
export const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

// ZOD VALIDATION
export const PASSWORD_MINIMAL_LENGTH = 8;

export const ZOD_ERROR_MESSAGE = {
  EMAIL_INVALID: "Invalid email format",
  PASSWORD_REQUIRED: "Password is required",
  PASSWORD_INVALID: `Password must be at least ${PASSWORD_MINIMAL_LENGTH} characters long`,
  PASSWORD_MISMATCH: "Passwords do not match",
} as const;

// AUTH ERROR MESSAGES
export const AUTH_ERROR_MESSAGES = {
  EMAIL_ALREADY_EXISTS: "Email already exists",
  INVALID_CREDENTIALS: "Invalid email or password",
  TOKEN_MISSING: "Authorization token is required",
  TOKEN_INVALID: "Invalid or expired token",
  USER_NOT_FOUND: "User not found",
} as const;

// API ROUTES
export const API_BASE_PATH = "/api";

export const AUTH_BASE_PATH = `${API_BASE_PATH}/auth`;

export const AUTH_ROUTES = {
  REGISTER: "/register",
  LOGIN: "/login",
  LOGOUT: "/logout",
  ME: "/me",
} as const;

export const AUTH_FULL_ROUTES = {
  REGISTER: `${AUTH_BASE_PATH}${AUTH_ROUTES.REGISTER}`,
  LOGIN: `${AUTH_BASE_PATH}${AUTH_ROUTES.LOGIN}`,
  LOGOUT: `${AUTH_BASE_PATH}${AUTH_ROUTES.LOGOUT}`,
  ME: `${AUTH_BASE_PATH}${AUTH_ROUTES.ME}`,
} as const;
