import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all admin routes except the login page itself
  if (pathname.startsWith("/admin") && pathname !== "/admin") {
    const token = request.cookies.get("admin_session")?.value;
    const password = process.env.ADMIN_PASSWORD;

    if (!password || token !== password) {
      const loginUrl = new URL("/admin", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path+"],
};
