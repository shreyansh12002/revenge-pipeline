import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("custom_subreddits")
      .select("name, created_at")
      .order("name");

    if (error) {
      console.error("Error fetching subreddits:", error);
      return NextResponse.json(
        { error: "Failed to fetch subreddits" },
        { status: 500 }
      );
    }

    return NextResponse.json({ subreddits: data || [] });
  } catch (error) {
    console.error("Error in GET /api/subreddits:", error);
    return NextResponse.json(
      { error: "Failed to fetch subreddits" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const { name } = body || {};

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Subreddit name is required" },
        { status: 400 }
      );
    }

    // Normalize name: lowercase, trim, remove r/ prefix
    const normalizedName = name
      .toLowerCase()
      .trim()
      .replace(/^r\//, "")
      .replace(/\s+/g, "");

    if (normalizedName.length === 0) {
      return NextResponse.json(
        { error: "Invalid subreddit name" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if already exists
    const { data: existing } = await supabase
      .from("custom_subreddits")
      .select("name, created_at")
      .eq("name", normalizedName)
      .single();

    if (existing) {
      return NextResponse.json({ subreddit: existing });
    }

    // Insert new subreddit
    const { data, error } = await supabase
      .from("custom_subreddits")
      .insert({ name: normalizedName })
      .select()
      .single();

    if (error) {
      console.error("Error inserting subreddit:", error);
      return NextResponse.json(
        { error: "Failed to add subreddit" },
        { status: 500 }
      );
    }

    return NextResponse.json({ subreddit: data }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/subreddits:", error);
    return NextResponse.json(
      { error: "Failed to add subreddit" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { error: "Subreddit name is required" },
        { status: 400 }
      );
    }

    // Normalize name: lowercase, trim, remove r/ prefix
    const normalizedName = name
      .toLowerCase()
      .trim()
      .replace(/^r\//, "");

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("custom_subreddits")
      .delete()
      .eq("name", normalizedName);

    if (error) {
      console.error("Error deleting subreddit:", error);
      return NextResponse.json(
        { error: "Failed to delete subreddit" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/subreddits:", error);
    return NextResponse.json(
      { error: "Failed to delete subreddit" },
      { status: 500 }
    );
  }
}
