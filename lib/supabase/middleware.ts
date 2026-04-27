import { NextResponse, type NextRequest } from "next/server";

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = ["/login", "/api/auth/", "/api/scrape", "/api/stories"];

/**
 * Update session based on request
 * Used in middleware to protect routes with custom cookie-based auth
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Get session cookie
  const sessionCookie = request.cookies.get("app_session");
  const isAuthenticated = sessionCookie?.value === "authenticated";

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");

  // Redirect to login if accessing protected route without session
  if (!isAuthenticated && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect to /stories if already authenticated and accessing login
  if (isAuthenticated && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/stories";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}