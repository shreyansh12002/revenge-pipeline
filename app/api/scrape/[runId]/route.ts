import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getApifyRunStatus, getApifyDatasetItems } from "@/lib/apify";
import { calculateViralScore } from "@/lib/viral-score";

interface ApifyRedditPost {
  id: string;
  title: string;
  body: string;
  authorName: string;
  parsedCommunityName: string;
  postUrl?: string;
  upVotes: number;
  commentsCount: number;
  createdAt: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;

    if (!runId || runId === "undefined") {
      console.log(`[scrape status] Invalid runId: "${runId}"`);
      return NextResponse.json({ status: "error", error: "Invalid run ID" }, { status: 400 });
    }

    console.log(`[scrape status] Checking runId: "${runId}", length: ${runId?.length}`);

    // Check for API token
    const apiToken = process.env.APIFY_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        { error: "APIFY_API_TOKEN not configured" },
        { status: 500 }
      );
    }

    // Log what the API call will look like
    const checkUrl = `https://api.apify.com/v2/acts/harshmaur~reddit-scraper/runs/${runId}`;
    console.log(`[scrape status] Calling Apify: ${checkUrl}`);

    // Get run status
    const run = await getApifyRunStatus(runId);
    console.log(`[scrape status] Run status: ${run.status}`);

    // If still running, return status
    if (run.status === "RUNNING") {
      return NextResponse.json({
        status: "running",
        itemsRead: 0, // Apify run info doesn't directly expose itemsRead
      });
    }

    // If failed or aborted
    if (run.status === "FAILED" || run.status === "ABORTED") {
      return NextResponse.json({
        status: "error",
        error: `Apify run ${run.status.toLowerCase()}`,
      });
    }

    // If succeeded, fetch and process items
    if (run.status === "SUCCEEDED") {
      // Get dataset ID from run details
      const runDetailsResponse = await fetch(
        `https://api.apify.com/v2/acts/harshmaur~reddit-scraper/runs/${runId}`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );

      if (!runDetailsResponse.ok) {
        throw new Error("Failed to get run details");
      }

      const runDetails = await runDetailsResponse.json();
      const datasetId = runDetails.data.defaultDatasetId;

      if (!datasetId) {
        throw new Error("No dataset ID found for run");
      }

      // Fetch items from dataset
      const items = await getApifyDatasetItems<ApifyRedditPost>(datasetId);

      // Transform and save stories
      type DbStoryRow = {
        id: string;
        apify_id: string;
        reddit_id: string;
        source: string;
        original_title: string;
        original_url: string;
        author: string;
        full_text: string;
        score: number;
        num_comments: number;
        quality_score: number;
        subreddit: string;
        url: string;
        upvotes: number;
        comment_count: number;
        scraped_at: string;
        viral_score: number;
        status: string;
      };
      const stories: DbStoryRow[] = [];

      for (const item of items) {
        // Skip posts without meaningful content
        if (!item.body || item.body.length < 200) continue;

        const score = item.upVotes ?? 0;
        const numComments = item.commentsCount ?? 0;
        const story = {
          id: crypto.randomUUID(),
          apify_id: item.id,
          reddit_id: item.id,
          source: `r/${item.parsedCommunityName}`,
          original_title: item.title,
          original_url: item.postUrl || "",
          author: item.authorName || "[deleted]",
          full_text: item.body,
          score,
          num_comments: numComments,
          quality_score: 0,
          subreddit: item.parsedCommunityName,
          url: item.postUrl || "",
          upvotes: score,
          comment_count: numComments,
          scraped_at: item.createdAt,
          viral_score: calculateViralScore({
            id: item.id,
            title: item.title,
            body: item.body,
            author: item.authorName || "[deleted]",
            subreddit: item.parsedCommunityName,
            url: item.postUrl || "",
            upvotes: score,
            comment_count: numComments,
            score: score,
            num_comments: numComments,
            scraped_at: item.createdAt,
          } as import("@/types").Story),
          status: "raw",
        };

        stories.push(story);
      }

      // Upsert to Supabase (skip duplicates via apify_id)
      const supabase = createAdminClient();

      // Batch upsert all stories at once — map to DB column names
      const { error: upsertError } = await supabase.from("stories").upsert(
        stories.map(s => ({
          apify_id: s.apify_id,
          reddit_id: s.reddit_id,
          source: s.source,
          original_title: s.original_title,
          original_url: s.original_url,
          author: s.author,
          full_text: s.full_text,
          score: s.score,
          num_comments: s.num_comments,
          subreddit: s.subreddit,
          upvotes: s.upvotes,
          comment_count: s.comment_count,
          scraped_at: s.scraped_at,
          viral_score: s.viral_score,
          status: s.status,
        })),
        { onConflict: "apify_id", ignoreDuplicates: true }
      );

      if (upsertError) {
        console.error("Error batch upserting stories:", upsertError);
      }

      return NextResponse.json({
        status: "completed",
        itemsCount: stories.length,
      });
    }

    // Unknown status
    return NextResponse.json({
      status: "unknown",
      error: `Unknown run status: ${run.status}`,
    });
  } catch (error) {
    console.error("Error checking scrape status:", error);
    const message =
      error instanceof Error ? error.message : "Failed to check scrape status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
