import { NextRequest, NextResponse } from 'next/server';
import { parseSetCookie } from 'cookie';
import { checkServerSession } from './lib/api/serverApi';
import { cookies } from 'next/headers';

const privateRoutes = ['/profile', '/notes'];
const publicRoutes = ['/sign-in', '/sign-up'];

export async function proxy(request: NextRequest) {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  const { pathname } = request.nextUrl;

  const isPrivateRoute = privateRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isPublicRoute = publicRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPrivateRoute && !accessToken && !refreshToken) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (!accessToken && refreshToken) {
    try {
      const sessionResponse = await checkServerSession(request.headers.get('cookie') ?? '');

      const setCookieHeaders = sessionResponse.headers['set-cookie'];
      const refreshedCookies = (
        Array.isArray(setCookieHeaders)
          ? setCookieHeaders
          : setCookieHeaders
            ? [setCookieHeaders]
            : []
      )
        .map(cookieHeader => parseSetCookie(cookieHeader))
        .filter(
          (cookie): cookie is NonNullable<typeof cookie> & { value: string } =>
            cookie !== undefined && typeof cookie.value === 'string' && cookie.value.length > 0
        );

      const hasAccessToken = refreshedCookies.some(cookie => cookie.name === 'accessToken');

      if (
        sessionResponse.status === 200 &&
        sessionResponse.data?.success === true &&
        hasAccessToken
      ) {
        const requestHeaders = new Headers(request.headers);
        const cookieValues = new Map(
          (requestHeaders.get('cookie') ?? '')
            .split(';')
            .map(value => value.trim())
            .filter(Boolean)
            .map(value => {
              const separator = value.indexOf('=');
              return [value.slice(0, separator), value.slice(separator + 1)] as const;
            })
        );

        for (const cookie of refreshedCookies) {
          cookieValues.set(cookie.name, cookie.value);
        }

        requestHeaders.set(
          'cookie',
          [...cookieValues].map(([name, value]) => `${name}=${value}`).join('; ')
        );

        const response = isPublicRoute
          ? NextResponse.redirect(new URL('/', request.url))
          : NextResponse.next({
              request: {
                headers: requestHeaders,
              },
            });

        for (const cookie of refreshedCookies) {
          response.cookies.set(cookie.name, cookie.value, {
            path: cookie.path ?? '/',
            domain: cookie.domain,
            expires: cookie.expires,
            maxAge: cookie.maxAge,
            httpOnly: cookie.httpOnly,
            secure: cookie.secure,
            sameSite: cookie.sameSite,
          });
        }

        return response;
      }

      if (isPrivateRoute) {
        const response = NextResponse.redirect(new URL('/sign-in', request.url));

        response.cookies.delete('accessToken');
        response.cookies.delete('refreshToken');

        return response;
      }
    } catch (error) {
      console.error('Session refresh failed:', error);

      if (isPrivateRoute) {
        const response = NextResponse.redirect(new URL('/sign-in', request.url));

        response.cookies.delete('accessToken');
        response.cookies.delete('refreshToken');

        return response;
      }
    }
  }

  if (isPublicRoute && accessToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};
