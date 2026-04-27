import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Parse query params
    const { searchParams } = new URL(request.url);
    const subreddit = searchParams.get("subreddit");
    const status = searchParams.get("status");
    const minScore = searchParams.get("minScore");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "scraped_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "30", 10);

    // Build query
    let query = supabase
      .from("stories")
      .select("*", { count: "exact" });

    // Apply filters
    if (subreddit) {
      query = query.eq("subreddit", subreddit);
    }

    if (status) {
      // Support comma-separated statuses for multiple statuses
      if (status.includes(",")) {
        const statuses = status.split(",").map(s => s.trim());
        query = query.in("status", statuses);
      } else {
        query = query.eq("status", status);
      }
    }

    if (minScore) {
      query = query.gte("viral_score", parseFloat(minScore));
    }

    if (search) {
      query = query.ilike("original_title", `%${search}%`);
    }

    // Apply sorting (map sortBy params to DB column names)
    const ascending = sortOrder === "asc";
    const dbSortColumn = sortBy === "upvotes" ? "score" : sortBy;
    query = query.order(dbSortColumn as "scraped_at" | "score" | "viral_score", {
      ascending,
    });

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data: dbRows, error, count } = await query;

    if (error) {
      console.error("Error fetching stories:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Map DB columns to Story type fields
    const stories = (dbRows || []).map((row: Record<string, unknown>) => ({
      ...row,
      title: row.original_title as string || row.title as string,
      body: row.full_text as string || row.body as string,
      subreddit: (row.subreddit as string) || (row.source as string)?.replace("r/", "") || (row.subreddit as string),
      url: row.original_url as string || row.url as string,
      upvotes: row.score as number ?? row.upvotes as number,
      comment_count: row.num_comments as number ?? row.comment_count as number,
      scraped_at: row.scraped_at as string || row.created_at as string,
    }));

    return NextResponse.json({
      success: true,
      data: stories,
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}