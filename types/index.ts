// Core story type — matches Supabase schema + extended fields
// DB columns: original_title, full_text, score, num_comments, source, original_url
// Extended fields added by ALTER TABLE: subreddit, url, upvotes, comment_count
export interface Story {
  id: string;
  apify_id?: string;
  reddit_id?: string;
  source?: string;
  title: string; // maps to original_title in DB
  original_url?: string;
  author: string;
  body: string; // maps to full_text in DB
  // Core DB columns (may be present or undefined depending on query)
  score?: number; // maps to upvotes in extended fields
  num_comments?: number; // maps to comment_count in extended fields
  quality_score?: number;
  youtube_package?: YouTubePackage;
  exported?: boolean;
  exported_at?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  // Extended fields for app logic (preferred for use in components)
  subreddit?: string;
  url?: string;
  upvotes?: number;
  comment_count?: number;
  scraped_at?: string;
  viral_score?: number;
  status?: StoryStatus;
  script?: YouTubeScript;
}

export type StoryStatus = "raw" | "scripted" | "packaged" | "exported";

// YouTube script with timestamps
export interface YouTubeScript {
  title: string;
  hook: string;
  setup: string;
  conflict: string;
  escalation: string;
  revenge: string;
  outcome: string;
  cta: string;
  content?: string;
  timestamps?: ScriptTimestamp[];
  word_count: number;
  estimated_duration: number; // in seconds
}

export interface ScriptTimestamp {
  time: string;
  label: string;
  description: string;
}

// Complete YouTube package for export
export interface YouTubePackage {
  titles: string[];
  thumbnail_text: string;
  description: string;
  tags: string[];
  hashtags: string[];
  voice_style: VoiceStyle;
  visual_prompts: VisualPrompt[];
  script: YouTubeScript;
}

export interface VoiceStyle {
  accent: string;
  tone: string;
  speed: number;
  pauses: boolean;
}

export interface VisualPrompt {
  scene: number;
  timestamp: string;
  description: string;
  style?: string;
}

// Apify scraper configuration
export interface ScrapeConfig {
  subreddits: string[];
  sort?: "hot" | "new" | "top";
  min_upvotes: number;
  min_comments: number;
  time_range: string;
  limit: number;
}

export interface ScrapeResult {
  success: boolean;
  run_id: string;
  stories: Story[];
  error?: string;
}

// Apify run status
export interface ApifyRun {
  id: string;
  status: ApifyRunStatus;
  started_at: string;
  finished_at?: string;
}

export type ApifyRunStatus = "RUNNING" | "SUCCEEDED" | "FAILED" | "ABORTED";

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Story filtering options
export interface StoryFilters {
  min_upvotes?: number;
  min_comments?: number;
  subreddits?: string[];
  status?: StoryStatus;
  date_range?: {
    from: string;
    to: string;
  };
}

// Claude AI generation request
export interface GenerationRequest {
  story: Story;
  channel_strategy?: string;
  options?: {
    include_visual_prompts?: boolean;
    num_titles?: number;
  };
}

// Stats and metrics
export interface StoryMetrics {
  viral_score: number;
  retention_risk: "low" | "medium" | "high";
  word_count: number;
  estimated_duration: number;
}