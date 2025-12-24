import { NextResponse } from "next/server"; // <--- C'EST ELLE QUI MANQUAIT !
import type { NextRequest } from "next/server";

// TES IDENTIFIANTS
const USER_NAME = "admin";
const PASSWORD = "cobalt";

export function middleware(req: NextRequest) {
  // On récupère le header d'authentification
  const basicAuth = req.headers.get("authorization");

  if (basicAuth) {
    // On décode le mot de passe
    const authValue = basicAuth.split(" ")[1];
    const [user, pwd] = atob(authValue).split(":");

    // Si c'est bon, on laisse passer
    if (user === USER_NAME && pwd === PASSWORD) {
      return NextResponse.next();
    }
  }

  // Sinon, on bloque
  return new NextResponse("Authentification requise", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};