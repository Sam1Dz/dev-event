import 'server-only';

export const HTTP_STATUS = {
  // 2xx Success
  OK: {
    code: 200,
    message: 'OK',
  },
  CREATED: {
    code: 201,
    message: 'CREATED',
  },
  ACCEPTED: {
    code: 202,
    message: 'ACCEPTED',
  },
  NO_CONTENT: {
    code: 204,
    message: 'NO_CONTENT',
  },

  // 4xx Client Error
  BAD_REQUEST: {
    code: 400,
    message: 'BAD_REQUEST',
  },
  UNAUTHORIZED: {
    code: 401,
    message: 'UNAUTHORIZED',
  },
  PAYMENT_REQUIRED: {
    code: 402,
    message: 'PAYMENT_REQUIRED',
  },
  FORBIDDEN: {
    code: 403,
    message: 'FORBIDDEN',
  },
  NOT_FOUND: {
    code: 404,
    message: 'NOT_FOUND',
  },
  METHOD_NOT_ALLOWED: {
    code: 405,
    message: 'METHOD_NOT_ALLOWED',
  },
  NOT_ACCEPTABLE: {
    code: 406,
    message: 'NOT_ACCEPTABLE',
  },
  CONFLICT: {
    code: 409,
    message: 'CONFLICT',
  },
  GONE: {
    code: 410,
    message: 'GONE',
  },
  LENGTH_REQUIRED: {
    code: 411,
    message: 'LENGTH_REQUIRED',
  },
  PRECONDITION_FAILED: {
    code: 412,
    message: 'PRECONDITION_FAILED',
  },
  PAYLOAD_TOO_LARGE: {
    code: 413,
    message: 'PAYLOAD_TOO_LARGE',
  },
  URI_TOO_LONG: {
    code: 414,
    message: 'URI_TOO_LONG',
  },
  UNSUPPORTED_MEDIA_TYPE: {
    code: 415,
    message: 'UNSUPPORTED_MEDIA_TYPE',
  },
  RANGE_NOT_SATISFIABLE: {
    code: 416,
    message: 'RANGE_NOT_SATISFIABLE',
  },
  EXPECTATION_FAILED: {
    code: 417,
    message: 'EXPECTATION_FAILED',
  },
  UNPROCESSABLE_ENTITY: {
    code: 422,
    message: 'UNPROCESSABLE_ENTITY',
  },
  LOCKED: {
    code: 423,
    message: 'LOCKED',
  },
  FAILED_DEPENDENCY: {
    code: 424,
    message: 'FAILED_DEPENDENCY',
  },
  TOO_EARLY: {
    code: 425,
    message: 'TOO_EARLY',
  },
  UPGRADE_REQUIRED: {
    code: 426,
    message: 'UPGRADE_REQUIRED',
  },
  PRECONDITION_REQUIRED: {
    code: 428,
    message: 'PRECONDITION_REQUIRED',
  },
  TOO_MANY_REQUESTS: {
    code: 429,
    message: 'TOO_MANY_REQUESTS',
  },
  REQUEST_HEADER_FIELDS_TOO_LARGE: {
    code: 431,
    message: 'REQUEST_HEADER_FIELDS_TOO_LARGE',
  },

  // 5xx Server Error
  INTERNAL_SERVER_ERROR: {
    code: 500,
    message: 'INTERNAL_SERVER_ERROR',
  },
  NOT_IMPLEMENTED: {
    code: 501,
    message: 'NOT_IMPLEMENTED',
  },
  BAD_GATEWAY: {
    code: 502,
    message: 'BAD_GATEWAY',
  },
  SERVICE_UNAVAILABLE: {
    code: 503,
    message: 'SERVICE_UNAVAILABLE',
  },
  GATEWAY_TIMEOUT: {
    code: 504,
    message: 'GATEWAY_TIMEOUT',
  },
  HTTP_VERSION_NOT_SUPPORTED: {
    code: 505,
    message: 'HTTP_VERSION_NOT_SUPPORTED',
  },
  INSUFFICIENT_STORAGE: {
    code: 507,
    message: 'INSUFFICIENT_STORAGE',
  },
  NOT_EXTENDED: {
    code: 510,
    message: 'NOT_EXTENDED',
  },
  NETWORK_AUTHENTICATION_REQUIRED: {
    code: 511,
    message: 'NETWORK_AUTHENTICATION_REQUIRED',
  },
} as const;
