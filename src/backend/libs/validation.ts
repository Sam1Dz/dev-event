import 'server-only';

import type z from 'zod';
import type { $ZodIssue } from 'zod/v4/core';

import { HTTP_STATUS } from '@/backend/constants/http-status';

import { apiError } from './response';

/**
 * Validates request body against a Zod schema.
 * @template T - The type of validated data
 * @param {Request} request - HTTP request object
 * @param {z.ZodSchema<T>} schema - Zod schema for validation
 * @returns {Promise<T>} Validated and parsed request body
 * @throws {NextResponse} Error response if validation fails
 */
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>,
): Promise<T> {
  const body = await request.json();
  const validationResult = schema.safeParse(body);

  if (!validationResult.success) {
    throw validationError(validationResult.error.issues);
  }

  return validationResult.data;
}

/**
 * Transforms Zod validation issues into standardized API error response.
 * Maps schema path and error message to error object format.
 * @param {$ZodIssue[]} issues - Array of Zod validation issues
 * @returns Formatted API error response with status 400
 */
export function validationError(issues: $ZodIssue[]) {
  // Transform validation issues into error detail objects with field paths
  const errors = issues.map((issue) => ({
    detail: issue.message,
    attr: issue.path.join('.'), // Join nested paths (e.g., "user.email")
  }));

  return apiError(
    HTTP_STATUS.BAD_REQUEST.message,
    HTTP_STATUS.BAD_REQUEST.code,
    errors,
  );
}
