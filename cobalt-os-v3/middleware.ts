import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('cobalt_session')?.value;
  const { pathname } = request.nextUrl;

  // 1. Si on n'est pas connecté et qu'on essaie d'aller sur une page protégée
  // (Tout ce qui n'est pas /login ou des fichiers statiques)
  if (!session && !pathname.startsWith('/login') && !pathname.includes('.')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Si on est déjà connecté et qu'on essaie d'aller sur /login
  if (session && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/private/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};