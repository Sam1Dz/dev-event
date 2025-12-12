import 'server-only';

import mongoose from 'mongoose';

import { withDatabase } from '@/backend/connection';
import { HTTP_STATUS } from '@/backend/constants/http-status';
import { apiError, apiSuccess } from '@/backend/libs/response';

export async function GET() {
  try {
    const result = await withDatabase(async () => {
      const db = mongoose.connection;

      if (!db.db) {
        throw new Error('MongoDB connection not initialized');
      }

      await db.db.admin().ping();

      return apiSuccess(
        HTTP_STATUS.OK.message,
        HTTP_STATUS.OK.code,
        null,
        'Database connection successful',
      );
    });

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Database connection failed';

    return apiError(
      HTTP_STATUS.SERVICE_UNAVAILABLE.message,
      HTTP_STATUS.SERVICE_UNAVAILABLE.code,
      [{ detail: errorMessage, attr: 'database' }],
      'server_error',
    );
  }
}
