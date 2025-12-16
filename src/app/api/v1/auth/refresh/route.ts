import { cookies } from 'next/headers';

import { withDatabase } from '@/backend/connection';
import { HTTP_STATUS } from '@/backend/constants/http-status';
import { signToken, verifyToken } from '@/backend/libs/jwt';
import {
  apiError,
  apiSuccess,
  internalServerError,
} from '@/backend/libs/response';
import User from '@/backend/models/user';
import { isProduction } from '@/core/libs/env';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const oldRefreshToken = cookieStore.get('refreshToken')?.value;

    if (!oldRefreshToken) {
      return apiError(
        HTTP_STATUS.UNAUTHORIZED.message,
        HTTP_STATUS.UNAUTHORIZED.code,
        [{ detail: 'Refresh token missing', attr: 'refreshToken' }],
      );
    }

    // Verify signature and expiration of the old refresh token
    const payload = await verifyToken(oldRefreshToken);

    if (!payload || !payload.userId) {
      return apiError(
        HTTP_STATUS.UNAUTHORIZED.message,
        HTTP_STATUS.UNAUTHORIZED.code,
        [{ detail: 'Invalid or expired refresh token', attr: 'refreshToken' }],
      );
    }

    return await withDatabase(async () => {
      const user = await User.findById(payload.userId);

      if (!user) {
        return apiError(
          HTTP_STATUS.UNAUTHORIZED.message,
          HTTP_STATUS.UNAUTHORIZED.code,
          [{ detail: 'User not found', attr: null }],
        );
      }

      // Check if the provided refresh token matches an active session
      const currentSessionIndex = user.sessions.findIndex(
        (session) => session.refreshToken === oldRefreshToken,
      );

      // Token Reuse Detection:
      // If the token is valid but not found in sessions, it means it was already used (and rotated).
      // This indicates a potential theft; revoke all sessions for security.
      if (currentSessionIndex === -1) {
        user.sessions = [];
        await user.save();

        return apiError(
          HTTP_STATUS.FORBIDDEN.message,
          HTTP_STATUS.FORBIDDEN.code,
          [
            {
              detail:
                'Security Alert: reused refresh token detected. All sessions have been revoked.',
              attr: null,
            },
          ],
        );
      }

      // Generate new token pair
      const newAccessToken = await signToken({ userId: user._id }, '15m');
      const newRefreshToken = await signToken({ userId: user._id }, '7d');

      // Update session with the new refresh token (Token Rotation)
      user.sessions[currentSessionIndex].refreshToken = newRefreshToken;

      await user.save();

      // Set new Access Token Cookie
      cookieStore.set('accessToken', newAccessToken, {
        httpOnly: true,
        secure: isProduction(),
        sameSite: 'strict',
        maxAge: 15 * 60, // 15 minutes
        path: '/',
      });

      cookieStore.set('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: isProduction(),
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      return apiSuccess(
        HTTP_STATUS.OK.message,
        HTTP_STATUS.OK.code,
        null,
        'Token refreshed successfully',
      );
    });
  } catch (error) {
    return internalServerError(error);
  }
}
