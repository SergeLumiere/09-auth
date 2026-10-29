import { NextRequest, NextResponse } from 'next/server';
import { parseSetCookie } from 'cookie';
import { checkServerSession } from './lib/api/serverApi';

const privateRoutes = ['/profile', '/notes'];
const publicRoutes = ['/sign-in', '/sign-up'];

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  const { pathname } = request.nextUrl;

  const isPrivateRoute = privateRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPrivateRoute && !accessToken && !refreshToken) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (!accessToken && refreshToken) {
    try {
      const response = await checkServerSession(request.headers.get('cookie') ?? '');

      const setCookieHeaders = response.headers['set-cookie'];

      if (
        response.status === 200 &&
        setCookieHeaders?.some((cookieHeader: string) => {
          const parsedCookie = parseSetCookie(cookieHeader);

          return parsedCookie?.name === 'accessToken' && Boolean(parsedCookie.value);
        })
      ) {
        const validCookies = [];

        for (const cookieHeader of setCookieHeaders) {
          const parsedCookie = parseSetCookie(cookieHeader);

          if (parsedCookie && parsedCookie.value !== undefined) {
            request.cookies.set(parsedCookie.name, parsedCookie.value);
            validCookies.push(cookieHeader);
          }
        }

        const nextResponse = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });

        for (const cookieHeader of validCookies) {
          nextResponse.headers.append('Set-Cookie', cookieHeader);
        }

        if (isPublicRoute) {
          const redirectResponse = NextResponse.redirect(new URL('/profile', request.url));

          for (const cookieHeader of validCookies) {
            redirectResponse.headers.append('Set-Cookie', cookieHeader);
          }

          return redirectResponse;
        }

        return nextResponse;
      }

      if (isPrivateRoute) {
        const redirectResponse = NextResponse.redirect(new URL('/sign-in', request.url));

        redirectResponse.cookies.delete('accessToken');
        redirectResponse.cookies.delete('refreshToken');

        return redirectResponse;
      }
    } catch (error) {
      console.error('Session refresh failed:', error);

      if (isPrivateRoute) {
        const redirectResponse = NextResponse.redirect(new URL('/sign-in', request.url));

        redirectResponse.cookies.delete('accessToken');
        redirectResponse.cookies.delete('refreshToken');

        return redirectResponse;
      }
    }
  }

  if (isPublicRoute && accessToken) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};
