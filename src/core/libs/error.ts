import type { ErrorResponseType } from '@/core/types/response';

/**
 * Custom error class for API error handling.
 * Encapsulates error details including type, code, and validation errors with timestamp.
 */
export class ApiError extends Error {
  public type: ErrorResponseType['type'] = 'server_error';
  public code: ErrorResponseType['code'] = '';
  public errors: ErrorResponseType['errors'] = [];
  public timestamp: ErrorResponseType['timestamp'] = '';

  /**
   * Creates an API error instance.
   * @param {string} message - Error message
   * @param {number} status - HTTP status code
   */
  constructor(
    public message: string,
    public status: number,
  ) {
    super(message);
  }

  /**
   * Populates error details from API response object.
   * Converts error details to JSON strings for consistent serialization.
   * @param {ErrorResponseType} response - Error response from API
   */
  public fromResponse(response: ErrorResponseType) {
    this.code = response.code;
    // Stringify non-string details for consistent storage
    this.errors = response.errors.map((error) => ({
      ...error,
      detail:
        typeof error.detail === 'string'
          ? error.detail
          : JSON.stringify(error.detail),
    }));
    this.timestamp = response.timestamp;
    this.type = response.type;
  }
}
