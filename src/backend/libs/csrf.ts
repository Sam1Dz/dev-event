import 'server-only';

import type { NextRequest } from 'next/server';

import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

import { cookies } from 'next/headers';

import { envServer } from '@/core/config/env';
import { isProduction } from '@/core/libs/env';

const CSRF_SECRET = envServer.SESSION_SECRET;
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_EXPIRY = 60 * 60 * 24;

const SKIP_PATHS = ['/api/v1/auth/login', '/api/v1/auth/register'];

/**
 * Generates a signed CSRF token with a timestamp.
 * Format: `token.timestamp.signature`
 *
 * @returns {string} The raw CSRF token string.
 */
export function generateCsrfToken(): string {
  // Generate valid token components
  const token = randomBytes(32).toString('hex');
  const timestamp = Date.now();
  const payload = `${token}.${timestamp}`;

  // Sign the payload using safe HMAC-SHA256
  const signature = createHmac('sha256', CSRF_SECRET)
    .update(payload)
    .digest('hex');

  return `${token}.${timestamp}.${signature}`;
}

/**
 * Verifies the validity of a CSRF token.
 * Checks signature integrity and expiration time.
 *
 * @param {string} token - The CSRF token to verify.
 * @returns {{ valid: boolean; expired: boolean }} Result object indicating validity and expiration status.
 */
export function verifyCsrfToken(token: string): {
  valid: boolean;
  expired: boolean;
} {
  if (!token || typeof token !== 'string') {
    return { valid: false, expired: false };
  }

  const parts = token.split('.');

  // Token must consist of: value, timestamp, signature
  if (parts.length !== 3) {
    return { valid: false, expired: false };
  }

  const [tokenValue, timestampStr, signature] = parts;

  if (!tokenValue || !timestampStr || !signature) {
    return { valid: false, expired: false };
  }

  // Reconstruct payload and verify signature
  const payload = `${tokenValue}.${timestampStr}`;
  const expectedSignature = createHmac('sha256', CSRF_SECRET)
    .update(payload)
    .digest('hex');

  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return { valid: false, expired: false };
  }

  // Check for expiration
  const timestamp = parseInt(timestampStr, 10);
  const now = Date.now();
  const age = (now - timestamp) / 1000;

  if (age > CSRF_TOKEN_EXPIRY) {
    return { valid: true, expired: true };
  }

  return { valid: true, expired: false };
}

/**
 * Generates a new CSRF token and sets it as a secure HTTP-only cookie.
 *
 * @returns {Promise<string>} The generated CSRF token.
 */
export async function setCsrfCookie(): Promise<string> {
  const token = generateCsrfToken();
  const cookieStore = await cookies();

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'strict',
    maxAge: CSRF_TOKEN_EXPIRY,
    path: '/',
  });

  return token;
}

/**
 * Validates the CSRF token for an incoming request.
 * Implements the Double Submit Cookie pattern.
 * Skips validation for safe methods (GET, HEAD, OPTIONS, TRACE) and whitelisted paths.
 *
 * @param req - The incoming Next.js request.
 * @returns {Promise<boolean>} True if valid or skipped, false otherwise.
 */
export async function validateCsrfToken(req: NextRequest): Promise<boolean> {
  const method = req.method;

  // Skip validation for safe methods and whitelisted paths
  if (
    ['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method) ||
    SKIP_PATHS.includes(req.nextUrl.pathname)
  ) {
    return true;
  }

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = req.headers.get(CSRF_HEADER_NAME);

  // Both parts are required for Double Submit Cookie pattern
  if (!cookieToken || !headerToken) {
    return false;
  }

  const verification = verifyCsrfToken(cookieToken);
  const cookieTokenBuffer = Buffer.from(cookieToken);
  const headerTokenBuffer = Buffer.from(headerToken);

  if (
    cookieTokenBuffer.length !== headerTokenBuffer.length ||
    !timingSafeEqual(cookieTokenBuffer, headerTokenBuffer)
  ) {
    return false;
  }

  return verification.valid;
}
