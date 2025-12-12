import { HTTP_STATUS } from '@/backend/constants/http-status';
import { apiSuccess } from '@/backend/libs/response';

export async function GET() {
  return apiSuccess('OK', HTTP_STATUS.OK.code, null, 'Server is alive');
}
