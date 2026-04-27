import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    // Validation
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get current stored hash
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
        { error: "Server not configured with password" },
        { status: 500 }
      );
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, storedHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);

    // Save new hash
    const { error: updateError } = await supabase
      .from("app_config")
      .upsert({ key: "app_password_hash", value: newHash }, { onConflict: "key" });

    if (updateError) {
      console.error("Error updating password:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update password" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}