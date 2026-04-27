import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { generateScript } from "@/lib/claude";
import type { Story } from "@/types";

// GET: Get script for a story
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Fetch the story
    const { data: story, error } = await supabase
      .from("stories")
      .select("script")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    return NextResponse.json({ script: story.script });
  } catch (error) {
    console.error("Error fetching script:", error);
    return NextResponse.json({ error: "Failed to fetch script" }, { status: 500 });
  }
}

// POST: Generate script
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
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
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
    };

    const storyBody = story.body;
    if (!storyBody || storyBody.trim().length === 0) {
      return NextResponse.json({ error: "Story has no content" }, { status: 400 });
    }

    // Generate script
    const script = await generateScript(story);

    // Save script to story
    await supabase
      .from("stories")
      .update({
        script,
        status: "scripted",
      })
      .eq("id", id);

    return NextResponse.json({ success: true, data: script });
  } catch (error) {
    console.error("Script generation error:", error);
    return NextResponse.json({ error: "Script generation failed" }, { status: 500 });
  }
}
