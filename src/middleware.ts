import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { getSessionOptions, type SessionData } from "@/lib/session";
import { applySecurityHeaders, rejectCrossOrigin, sameOrigin } from "@/lib/security";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && pathname.startsWith("/api/")) {
    if (!sameOrigin(request)) {
      return applySecurityHeaders(rejectCrossOrigin(), pathname);
    }
  }

  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";

  if (!isAdminPage && !isAdminApi) {
    const response = NextResponse.next();
    return applySecurityHeaders(response, pathname);
  }

  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, getSessionOptions());

  if (!session.isLoggedIn || !session.adminId) {
    if (isAdminApi) {
      const denied = NextResponse.json({ error: "ADMIN AUTHENTICATION REQUIRED" }, { status: 401 });
      return applySecurityHeaders(denied, pathname);
    }
    const loginUrl = new URL("/admin/login", request.url);
    if (pathname.startsWith("/admin") && !pathname.includes("://")) {
      loginUrl.searchParams.set("from", pathname);
    }
    const redirect = NextResponse.redirect(loginUrl);
    return applySecurityHeaders(redirect, pathname);
  }

  return applySecurityHeaders(response, pathname);
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/:path*"],
};
