import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Try to get password hash from app_config table first
    const { data: configData, error: configError } = await supabase
      .from("app_config")
      .select("value")
      .eq("key", "app_password_hash")
      .single();

    let storedHash: string | null = null;

    if (!configError && configData) {
      storedHash = configData.value;
    } else {
      // Fall back to environment variable
      storedHash = process.env.APP_PASSWORD_HASH || null;
    }

    // If no password is configured, return error
    if (!storedHash) {
      return NextResponse.json(
        { error: "Server not configured" },
        { status: 500 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, storedHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Create response with success
    const response = NextResponse.json({ success: true });

    // Set session cookie
    response.cookies.set("app_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}