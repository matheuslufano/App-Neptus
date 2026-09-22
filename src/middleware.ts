import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Se tem token e está tentando acessar página pública, redireciona para home
    if (
      token &&
      (pathname.startsWith("/login") ||
        pathname.startsWith("/cadastro") ||
        pathname.startsWith("/recuperar-senha") ||
        pathname.startsWith("/redefinir-senha"))
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        const publicRoutes = [
          "/login",
          "/cadastro",
          "/recuperar-senha",
          "/redefinir-senha",
          "/api/auth",
        ];

        const staticFiles = [
          "/_next",
          "/images",
          "/assets",
          "/manifest.json",
          "/sw.js",
          "/workbox-",
          "/android-chrome-",
          "/favicon.ico",
        ];

        // Permite acesso a rotas pública
        if (publicRoutes.some((route) => pathname.startsWith(route))) {
          return true;
        }

        // Permite acesso a arquivos estáticos
        if (
          staticFiles.some((file) => pathname.startsWith(file)) ||
          pathname.includes(".")
        ) {
          return true;
        }

        // Se tem token válido do NextAuth, permite acesso
        if (token) {
          return true;
        }

        // Se não tem token, o middleware bloqueia mas o AuthGuard (client-side)
        // vai verificar se há sessão offline válida no localStorage
        // O middleware permite passar para que o AuthGuard faça a verificação client-side
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api(?!/auth)|_next/static|_next/image|favicon.ico).*)"],
};
