import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { calculateViralScore } from "@/lib/viral-score";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Fetch story from Supabase
    const { data: story, error } = await supabase
      .from("stories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Story not found" },
          { status: 404 }
        );
      }
      console.error("Error fetching story:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Calculate new viral score
    const viralScore = calculateViralScore(story);

    // Update viral_score in database
    const { error: updateError } = await supabase
      .from("stories")
      .update({ viral_score: viralScore })
      .eq("id", id);

    if (updateError) {
      console.error("Error updating viral score:", updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      viral_score: viralScore
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
