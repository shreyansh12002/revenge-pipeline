import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: dbRow, error } = await supabase
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

    // Map DB columns to Story type fields
    const story: Record<string, unknown> = {
      ...dbRow,
      title: dbRow.original_title as string || dbRow.title as string,
      body: dbRow.full_text as string || dbRow.body as string,
      subreddit: (dbRow.subreddit as string) || (dbRow.source as string)?.replace("r/", "") || (dbRow.subreddit as string),
      url: dbRow.original_url as string || dbRow.url as string,
      upvotes: dbRow.score as number ?? dbRow.upvotes as number,
      comment_count: dbRow.num_comments as number ?? dbRow.comment_count as number,
      scraped_at: dbRow.scraped_at as string || dbRow.created_at as string,
    };

    return NextResponse.json({ success: true, data: story });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("stories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting story:", error);
      return NextResponse.json(
        { success: false, error: error.message },
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