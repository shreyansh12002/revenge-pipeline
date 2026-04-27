import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  // Read session cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("app_session");
  const isAuthenticated = sessionCookie?.value === "authenticated";

  return NextResponse.json({ authenticated: isAuthenticated });
}