import 'server-only';

import { SignJWT, jwtVerify } from 'jose';

import { envServer } from '@/core/config/env';

const SECRET_KEY = new TextEncoder().encode(envServer.SESSION_SECRET);
const ALG = 'HS256';

/**
 * Creates a signed JWT with the specified payload and expiration time.
 * @param payload - The data to embed in the token.
 * @param expires - Expiration time string (e.g., '2h', '7d').
 * @returns Promise resolving to the signed JWT string.
 */
export async function signToken(
  payload: Record<string, unknown>,
  expires: string,
) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(SECRET_KEY);
}

/**
 * Verifies a JWT and retrieves its payload.
 * @param token - The JWT string to verify.
 * @returns The token payload if valid, or null if invalid or expired.
 */
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);

    return payload;
  } catch {
    return null;
  }
}
