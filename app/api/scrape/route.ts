import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { startApifyRun } from "@/lib/apify";
import type { ScrapeConfig } from "@/types";

const DEFAULT_SUBREDDITS = [
  "ProRevenge",
  "NuclearRevenge",
  "MaliciousCompliance",
  "EntitledPeople",
  "AmITheAsshole",
  "TrueOffMyChest",
];

export async function POST(request: NextRequest) {
  try {
    // Check for API token
    const apiToken = process.env.APIFY_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        { error: "APIFY_API_TOKEN not configured" },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const {
      subreddits: requestedSubreddits,
      sort = "top",
      timeRange = "month",
      maxItems = 50,
      minUpvotes = 3000,
      minComments = 200,
    } = body as {
      subreddits?: string[];
      sort?: "hot" | "new" | "top";
      timeRange?: "day" | "week" | "month" | "year" | "all";
      maxItems?: number;
      minUpvotes?: number;
      minComments?: number;
    };

    // Get custom subreddits from Supabase
    const supabase = createAdminClient();
    const { data: customSubreddits, error: subredditError } = await supabase
      .from("custom_subreddits")
      .select("name");

    if (subredditError) {
      console.error("Error fetching custom subreddits:", subredditError);
    }

    // Combine default + custom subreddits
    const customNames = (customSubreddits || []).map((s) => s.name);
    const allSubreddits = [...DEFAULT_SUBREDDITS, ...customNames];

    // Filter to requested subreddits if provided
    const subreddits =
      requestedSubreddits && requestedSubreddits.length > 0
        ? allSubreddits.filter((s) => requestedSubreddits.includes(s))
        : allSubreddits;

    // Build scrape config
    const config: ScrapeConfig = {
      subreddits,
      sort,
      min_upvotes: minUpvotes,
      min_comments: minComments,
      time_range: timeRange,
      limit: maxItems,
    };

    // Start Apify run
    const result = await startApifyRun(config);

    return NextResponse.json({ runId: result.runId });
  } catch (error) {
    console.error("Error starting scrape:", error);
    const message =
      error instanceof Error ? error.message : "Failed to start scrape";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
