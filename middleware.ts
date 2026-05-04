import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/middleware";

const PROTECTED_ROUTES = ["/dashboard", "/campaigns", "/onboarding/business"];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await createClient(request);

  const isProtected = PROTECTED_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route));

  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from /login back to dashboard
  if (request.nextUrl.pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
