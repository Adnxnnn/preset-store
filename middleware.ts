import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Redirect legacy customer login & account routes to store
  if (pathname === '/login' || pathname === '/account') {
    return NextResponse.redirect(new URL('/store', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/account'],
};
