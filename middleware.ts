import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and auth pages
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/" // Home page handles auth logic internally
  ) {
    return NextResponse.next();
  }

  try {
    // Check if session cookie exists
    const sessionCookie = request.cookies.get("sandy_cal_session");

    if (!sessionCookie) {
      // No session cookie, redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Let the session validation happen in the page components
    // The cookie existence check is sufficient for middleware
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - / (home page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|$).*)",
  ],
};
