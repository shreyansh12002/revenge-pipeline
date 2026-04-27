import { createAdminClient } from "@/lib/supabase/server";
import { generateYouTubePackage } from "@/lib/claude";
import { NextRequest, NextResponse } from "next/server";
import type { Story, YouTubeScript } from "@/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = createAdminClient();

    // Fetch the story
    const { data: dbRow, error: fetchError } = await supabase
      .from("stories")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json({ success: false, error: "Story not found" }, { status: 404 });
    }

    // Map DB columns to Story type
    const story: Story = {
      id: dbRow.id,
      title: (dbRow.original_title as string) || (dbRow.title as string),
      body: (dbRow.full_text as string) || (dbRow.body as string),
      subreddit: (dbRow.subreddit as string) || (dbRow.source as string)?.replace("r/", ""),
      url: (dbRow.original_url as string) || (dbRow.url as string),
      author: dbRow.author as string,
      upvotes: (dbRow.score as number) ?? (dbRow.upvotes as number),
      comment_count: (dbRow.num_comments as number) ?? (dbRow.comment_count as number),
      scraped_at: (dbRow.scraped_at as string) || (dbRow.created_at as string),
      script: dbRow.script as YouTubeScript,
    };

    const storyBody = story.body;
    if (!storyBody || storyBody.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Story has no content" }, { status: 400 });
    }

    if (!story.script) {
      return NextResponse.json({ success: false, error: "Story must have a script before generating package" }, { status: 400 });
    }

    // Generate package
    const youtube_package = await generateYouTubePackage(story, story.script);

    // Update story status to packaged
    await supabase
      .from("stories")
      .update({
        status: "packaged",
        youtube_package,
      })
      .eq("id", id);

    return NextResponse.json({ success: true, data: youtube_package });
  } catch (error) {
    console.error("Package generation error:", error);
    return NextResponse.json({ success: false, error: "Package generation failed" }, { status: 500 });
  }
}
