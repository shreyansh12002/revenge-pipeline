import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function DELETE(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const supabase = createAdminClient();

    // Delete all stories using a condition that always matches
    const { error: storiesError } = await supabase
      .from("stories")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (storiesError) {
      console.error("Error clearing stories:", storiesError);
      return NextResponse.json(
        { success: false, error: "Failed to clear stories" },
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