import { execSync } from 'child_process';

import { HTTP_STATUS } from '@/backend/constants/http-status';
import { apiSuccess, internalServerError } from '@/backend/libs/response';

export async function GET() {
  try {
    let commitHash = '';

    try {
      commitHash = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    } catch {
      commitHash = 'unknown';
    }

    const pkg = await import('../../../../../../package.json', {
      assert: { type: 'json' },
    });
    const version = pkg.default.version;

    return apiSuccess(
      HTTP_STATUS.OK.message,
      HTTP_STATUS.OK.code,
      {
        version,
        commit: commitHash,
      },
      'Version information retrieved',
    );
  } catch (error) {
    return internalServerError(error);
  }
}
