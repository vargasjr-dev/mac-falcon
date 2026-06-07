import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get("admin_session")?.value;
  const password = process.env.ADMIN_PASSWORD;
  return !!password && token === password;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API admin routes — return 401 JSON if not authenticated
  if (pathname.startsWith("/api/admin/")) {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Admin login page — if already authenticated, send straight to dashboard
  if (pathname === "/admin") {
    if (isAuthenticated(request)) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // All other admin pages — require auth
  if (pathname.startsWith("/admin/")) {
    if (!isAuthenticated(request)) {
      const loginUrl = new URL("/admin", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path+", "/api/admin/:path+"],
};
