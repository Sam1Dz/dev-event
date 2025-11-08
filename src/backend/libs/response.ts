import 'server-only';

import { NextResponse } from 'next/server';

import { HTTP_STATUS } from '@/backend/constants/http-status';
import type { ApiErrorType, ApiSuccessType } from '@/core/types/response';

/**
 * Constructs a standardized successful API response with data.
 * Includes timestamp for response tracking and auditing.
 * @template T - Type of the response data payload
 * @param {string} code - Response code identifier
 * @param {number} status - HTTP status code
 * @param {T} data - Response data payload
 * @param {string} detail - Human-readable success message
 * @returns JSON response with success data
 */
export function apiSuccess<T>(
  code: ApiSuccessType<T>['code'],
  status: number,
  data: T,
  detail: string,
) {
  const successResponse: ApiSuccessType<T> = {
    code,
    detail,
    data,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(successResponse, { status });
}

/**
 * Constructs a standardized error API response.
 * Defaults to client error type; use 'server_error' for 5xx responses.
 * @param {string} code - Error code identifier
 * @param {number} status - HTTP status code
 * @param {Array} errors - Array of error objects with detail and optional attr
 * @param {string} [type='client_error'] - Error classification: 'client_error' or 'server_error'
 * @returns JSON response with error details
 */
export function apiError(
  code: ApiErrorType['code'],
  status: number,
  errors: ApiErrorType['errors'],
  type: ApiErrorType['type'] = 'client_error',
) {
  const errorResponse: ApiErrorType = {
    type,
    code,
    errors,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(errorResponse, { status });
}

/**
 * Handles unexpected server errors with security-conscious error reporting.
 * Logs full error server-side; sends sanitized message to client to avoid exposing internals.
 * @param {unknown} error - Caught error object (any type)
 * @returns JSON error response with status 500
 */
export function internalServerError(error: unknown) {
  console.error('API Route Error:', error);

  // Extract error message or use generic fallback to avoid leaking sensitive info
  const detail =
    error instanceof Error ? error.message : 'Unknown server error';

  return apiError(
    HTTP_STATUS.INTERNAL_SERVER_ERROR.message,
    HTTP_STATUS.INTERNAL_SERVER_ERROR.code,
    [{ detail, attr: null }],
    'server_error',
  );
}
