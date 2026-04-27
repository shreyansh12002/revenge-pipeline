import type { Story } from "@/types";
import { formatDuration } from "@/lib/utils";

export function exportToText(story: Story): string {
  const script = story.script;
  const pkg = story.youtube_package;

  let text = `=== ${story.title} ===\n`;
  text += `From: r/${story.subreddit} | Author: ${story.author || "Anonymous"}\n`;
  text += `Upvotes: ${story.upvotes} | Comments: ${story.comment_count}\n`;
  text += `URL: ${story.url}\n\n`;

  if (script) {
    text += `=== SCRIPT ===\n`;
    text += `HOOK (0:00 - 0:07)\n${script.hook}\n\n`;
    text += `SETUP (0:07 - 0:40)\n${script.setup}\n\n`;
    text += `CONFLICT (0:40 - 2:00)\n${script.conflict}\n\n`;
    text += `ESCALATION (2:00 - 4:30)\n${script.escalation}\n\n`;
    text += `REVENGE (4:30 - 7:30)\n${script.revenge}\n\n`;
    text += `OUTCOME (7:30 - 9:00)\n${script.outcome}\n\n`;
    text += `CTA (9:00+)\n${script.cta}\n\n`;
    text += `Word Count: ${script.word_count} | Duration: ${formatDuration(script.estimated_duration)}\n\n`;
  }

  if (pkg) {
    text += `=== YOUTUBE PACKAGE ===\n\n`;
    text += `TITLES:\n${pkg.titles.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\n`;
    text += `THUMBNAIL TEXT: ${pkg.thumbnail_text}\n\n`;
    text += `DESCRIPTION:\n${pkg.description}\n\n`;
    text += `TAGS: ${pkg.tags.join(", ")}\n\n`;
    text += `HASHTAGS: ${pkg.hashtags.join(" ")}\n`;
  }

  return text;
}

export function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
