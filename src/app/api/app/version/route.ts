import 'server-only';

import { execSync } from 'child_process';

import { HTTP_STATUS } from '@/backend/constants/http-status';
import { apiSuccess, internalServerError } from '@/backend/libs/response';

/**
 * GET /api/app/version
 * Version information endpoint that returns the current Git commit hash and package.json version.
 * Useful for debugging to determine which version of the code is running in production.
 */
export async function GET() {
  try {
    let commitHash = '';

    try {
      commitHash = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    } catch {
      commitHash = 'unknown';
    }

    const pkg = await import('../../../../../package.json', {
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
