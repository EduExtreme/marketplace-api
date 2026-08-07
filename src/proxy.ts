import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasSessionCookie } from "@/lib/auth/session";

const PROTECTED_ROUTES = ["/account"];
// A própria página faz a gate de auth por ação (buscar/assinar exigem login),
// mas o acesso à página em si é público — ver src/app/account/leads/page.tsx.
const PUBLIC_ACCOUNT_ROUTES = ["/account/leads"];
const AUTH_ROUTES = ["/login", "/signup"];

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const isAuthenticated = await hasSessionCookie();

  const isPublicAccountRoute = PUBLIC_ACCOUNT_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedRoute = !isPublicAccountRoute && PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/login", "/signup"],
};
