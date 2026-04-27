import type { Story } from "@/types";

export function exportToJSON(story: Story): string {
  return JSON.stringify({
    title: story.title,
    subreddit: story.subreddit,
    author: story.author,
    upvotes: story.upvotes,
    comments: story.comment_count,
    url: story.url,
    script: story.script,
    youtube_package: story.youtube_package,
    viral_score: story.viral_score,
    exported_at: new Date().toISOString(),
  }, null, 2);
}

export function downloadJSON(content: string, filename: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
