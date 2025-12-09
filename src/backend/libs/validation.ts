import 'server-only';

import type { NextRequest } from 'next/server';
import type z from 'zod';
import type { $ZodIssue } from 'zod/v4/core';

import { HTTP_STATUS } from '@/backend/constants/http-status';

import { apiError } from './response';

/**
 * Validates request body against a Zod schema.
 * Handles JSON parsing errors and Zod validation failures.
 *
 * @template T - The type of the validated data.
 * @param request - The incoming NextRequest object.
 * @param schema - Zod schema to validate against.
 * @returns Promise resolving to the validated data.
 * @throws {Response} If validation fails or JSON is malformed.
 */
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>,
): Promise<T> {
  let body;

  try {
    body = await request.json();
  } catch {
    throw apiError(
      HTTP_STATUS.BAD_REQUEST.message,
      HTTP_STATUS.BAD_REQUEST.code,
      [{ detail: 'Invalid JSON payload', attr: null }],
    );
  }

  const validationResult = schema.safeParse(body);

  if (!validationResult.success) {
    throw validationError(validationResult.error.issues);
  }

  return validationResult.data;
}

/**
 * Transforms Zod validation issues into a standardized API error response.
 *
 * @param issues - Array of Zod validation issues.
 * @returns Standardized API error response (Bad Request).
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
