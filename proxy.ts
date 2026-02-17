import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/utils/auth';
import { ratelimit } from './utils/rate-limit';
import { fail } from './utils/helpers';
import { isProduction } from './utils/db';

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    // Return JSON response for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return fail(401, 'Unauthorized');
    }
    // Page redirect for non API routes
    return NextResponse.redirect(
      new URL('/auth/login', request.url)
    );
  }

  if (
    request.nextUrl.pathname.startsWith('/api/') &&
    isProduction
  ) {
    const { success } = await ratelimit.limit(
      session.user.id
    );

    if (!success) {
      return fail(
        429,
        'Too many requests. Please try again later.'
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/pages/transactions/:path*',
    '/pages/categories/:path*',
    '/pages/accounts/:path*',
    '/api/((?!auth).*)',
  ],
};
