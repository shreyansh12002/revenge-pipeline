import type { Story, ScrapeConfig, ApifyRun } from "@/types";
import { calculateViralScore } from "./viral-score";

const ACTOR_ID = "harshmaur~reddit-scraper";
const APIFY_API_URL = "https://api.apify.com/v2";

export interface ApifyInput {
  // Target subreddit
  withinCommunity?: string;
  // Search terms (use subreddit URLs instead)
  searchTerms?: string[];
  // Sort: hot, new, top, relevance, comments
  sort?: string;
  // Time range
  timeRange?: string;
  // Post limits
  maxPostsCount?: number;
  // Include NSFW
  includeNSFW?: boolean;
  // Crawl comments
  crawlCommentsPerPost?: boolean;
  // Custom URLs to scrape (for subreddits)
  startUrls?: Array<{ url: string }>;
}

/**
 * Start a new Apify Reddit scraper run
 */
export async function startApifyRun(
  config: ScrapeConfig
): Promise<{ runId: string; statusUrl: string }> {
  const apiToken = process.env.APIFY_API_TOKEN;
  if (!apiToken) {
    throw new Error("APIFY_API_TOKEN is not configured");
  }

  const input: ApifyInput = {
    startUrls: config.subreddits.map((s) => {
      const name = s.replace(/^r\//, "");
      return { url: `https://www.reddit.com/r/${name}` };
    }),
    sort: config.sort || "top",
    timeRange: config.time_range,
    maxPostsCount: config.limit,
    crawlCommentsPerPost: false,
  };

  const response = await fetch(`${APIFY_API_URL}/acts/${ACTOR_ID}/runs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to start Apify run: ${error}`);
  }

  const data = await response.json();
  return {
    runId: data.data.id,
    statusUrl: data.data.statusUrl,
  };
}

/**
 * Get the status of an Apify run
 */
export async function getApifyRunStatus(runId: string): Promise<ApifyRun> {
  const apiToken = process.env.APIFY_API_TOKEN;
  if (!apiToken) {
    throw new Error("APIFY_API_TOKEN is not configured");
  }

  const url = `${APIFY_API_URL}/acts/${ACTOR_ID}/runs/${runId}`;
  console.log(`[getApifyRunStatus] URL: ${url}, runId: ${runId}`);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.log(`[getApifyRunStatus] Error response: ${error}`);
    throw new Error(`Failed to get run status: ${error}`);
  }

  const data = await response.json();
  return {
    id: data.data.id,
    status: data.data.status,
    started_at: data.data.startedAt,
    finished_at: data.data.finishedAt,
  };
}

/**
 * Get items from an Apify dataset
 */
export async function getApifyDatasetItems<T>(
  datasetId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<T[]> {
  const apiToken = process.env.APIFY_API_TOKEN;
  if (!apiToken) {
    throw new Error("APIFY_API_TOKEN is not configured");
  }

  let url = `https://api.apify.com/v2/datasets/${datasetId}/items?format=json&clean=true`;
  if (options?.limit) {
    url += `&limit=${options.limit}`;
  }
  if (options?.offset) {
    url += `&offset=${options.offset}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get dataset items: ${error}`);
  }

  return response.json();
}

/**
 * Scrape Reddit and return stories
 */
export async function scrapeReddit(
  config: ScrapeConfig
): Promise<{ runId: string }> {
  return startApifyRun(config);
}

/**
 * Poll Apify run until completion and return stories
 */
export async function pollAndFetchStories(
  runId: string,
  config: ScrapeConfig,
  pollIntervalMs = 5000,
  maxWaitMs = 120000
): Promise<Story[]> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const run = await getApifyRunStatus(runId);

    if (run.status === "SUCCEEDED") {
      // Get dataset ID from run details
      const runDetails = await fetch(
        `${APIFY_API_URL}/acts/${ACTOR_ID}/runs/${runId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.APIFY_API_TOKEN}`,
          },
        }
      );
      const details = await runDetails.json();
      const datasetId = details.data.defaultDatasetId;

      if (!datasetId) {
        throw new Error(`No dataset ID for run ${runId}`);
      }

      const items = await getApifyDatasetItems<ApifyRedditPost>(datasetId, {
        limit: config.limit,
      });

      return transformApifyItems(items, config);
    }

    if (run.status === "FAILED" || run.status === "ABORTED") {
      throw new Error(`Apify run ${runId} ${run.status.toLowerCase()}`);
    }

    // Wait before polling again
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(`Timed out waiting for Apify run ${runId}`);
}

interface ApifyRedditPost {
  id: string;
  title: string;
  body: string;
  authorName: string;
  parsedCommunityName: string;
  communityName: string;
  contentUrl?: string;
  postUrl?: string;
  upVotes: number;
  commentsCount: number;
  createdAt: string;
}

/**
 * Transform Apify items to Story format
 */
function transformApifyItems(
  items: ApifyRedditPost[],
  config: ScrapeConfig
): Story[] {
  const stories: Story[] = [];

  for (const item of items) {
    // Skip posts with too few upvotes or comments
    if (item.upVotes < config.min_upvotes) continue;
    if (item.commentsCount < config.min_comments) continue;

    // Skip posts without meaningful content
    if (!item.body || item.body.length < 200) continue;

    const story: Story = {
      id: crypto.randomUUID(),
      apify_id: item.id,
      title: item.title,
      body: item.body,
      author: item.authorName || "[deleted]",
      subreddit: item.parsedCommunityName,
      url: item.postUrl || item.contentUrl || "",
      upvotes: item.upVotes,
      comment_count: item.commentsCount,
      score: item.upVotes, // DB column
      num_comments: item.commentsCount, // DB column
      scraped_at: item.createdAt,
      viral_score: calculateViralScore({
        id: item.id,
        title: item.title,
        body: item.body,
        author: item.authorName || "[deleted]",
        subreddit: item.parsedCommunityName,
        url: item.postUrl || item.contentUrl || "",
        upvotes: item.upVotes,
        comment_count: item.commentsCount,
        score: item.upVotes,
        num_comments: item.commentsCount,
        scraped_at: item.createdAt,
      } as Story),
      status: "raw",
    };

    stories.push(story);
  }

  return stories;
}