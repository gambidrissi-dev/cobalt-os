import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // On récupère le cookie de session
  const session = request.cookies.get('cobalt_session');
  
  // Si on est déjà sur la page login, on laisse passer
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next();
  }

  // Si pas de session -> Redirection Login
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// On applique ça partout SAUF sur les fichiers statiques (images, css...)
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};