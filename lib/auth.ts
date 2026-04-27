import { NextRequest, NextResponse } from "next/server";

/**
 * Validates that the request has a valid authenticated session.
 * Returns a 401 Unauthorized response if not authenticated, otherwise null.
 */
export function requireAuth(request: NextRequest): NextResponse | null {
  const session = request.cookies.get("app_session");
  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null; // authorized
}
