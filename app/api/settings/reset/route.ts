import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function DELETE(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const supabase = createAdminClient();

    // Delete all from app_config
    const { error: configError } = await supabase
      .from("app_config")
      .delete()
      .neq("key", "placeholder"); // Always true condition

    if (configError) {
      console.error("Error resetting app_config:", configError);
    }

    // Delete all from custom_subreddits
    const { error: subredditsError } = await supabase
      .from("custom_subreddits")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (subredditsError) {
      console.error("Error resetting custom_subreddits:", subredditsError);
    }

    // Delete all from stories
    const { error: storiesError } = await supabase
      .from("stories")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (storiesError) {
      console.error("Error resetting stories:", storiesError);
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