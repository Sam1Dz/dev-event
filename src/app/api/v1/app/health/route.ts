import { HTTP_STATUS } from '@/backend/constants/http-status';
import { apiSuccess } from '@/backend/libs/response';

/**
 * GET /api/v1/app/health
 * Basic health check endpoint to confirm the Next.js server is running.
 * Used for liveness probes by hosting platforms (e.g., Vercel, AWS, Kubernetes).
 * Does not check database or external services.
 */
export async function GET() {
  return apiSuccess('OK', HTTP_STATUS.OK.code, null, 'Server is alive');
}
