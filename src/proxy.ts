import { NextResponse, type NextRequest } from 'next/server';

import { HTTP_STATUS } from './backend/constants/http-status';
import { validateCsrfToken } from './backend/libs/csrf';
import { apiError } from './backend/libs/response';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/v1')) {
    const isValid = await validateCsrfToken(request);

    if (!isValid) {
      return apiError(
        HTTP_STATUS.FORBIDDEN.message,
        HTTP_STATUS.FORBIDDEN.code,
        [{ detail: 'Invalid CSRF token', attr: 'csrf' }],
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
