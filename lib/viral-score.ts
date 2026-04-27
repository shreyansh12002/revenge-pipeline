import type { Story } from "@/types";

/**
 * Viral keywords that indicate high-engagement content
 */
export const VIRAL_KEYWORDS = [
  "revenge",
  "fired",
  "boss",
  "cheating",
  "divorce",
  "toxic",
  "laid off",
  "backstab",
  "sabotage",
  "betrayal",
  "injustice",
  "humiliation",
  "destruction",
  "obliterated",
  "ruined",
  "destroyed",
  "cringe",
  "satisfying",
  "karma",
  "deserved",
  "payback",
  "entitled",
  "exposed",
  "caught",
  "confrontation",
  "rejected",
  "walked out",
  "quit",
  "revealed",
  "proof",
];

/**
 * Title intensity words that boost click-through rates
 */
export const TITLE_INTENSITY_WORDS = [
  "Destroyed",
  "Ruined",
  "Fired",
  "Exposed",
  "REVENGE",
  "KARMA",
  "BIGGEST",
  "WORST",
  "MASSIVE",
  "SHOCKING",
  "BRUTAL",
  "UNBELIEVABLE",
  "WTF",
  "INSANE",
  "CRAZY",
];

/**
 * Calculate viral score for a story (0-100)
 * Based on engagement metrics and content quality
 */
export function calculateViralScore(story: Story): number {
  // Base metrics (0-100)
  let score = 0;

  // Upvotes weight: 30%
  // Normalize upvotes (log scale, max at ~50k)
  const upvotes = story.upvotes ?? story.score ?? 0;
  const upvoteScore = Math.min(30, Math.log10(upvotes + 1) * 6);
  score += upvoteScore;

  // Comments weight: 25%
  // Normalize comments (log scale, max at ~10k)
  const commentCount = story.comment_count ?? story.num_comments ?? 0;
  const commentScore = Math.min(25, Math.log10(commentCount + 1) * 5);
  score += commentScore;

  // Content length weight: 15%
  // Optimal length is 500-3000 words
  const bodyLength = (story.body || "").length;
  let lengthScore = 0;
  if (bodyLength >= 500 && bodyLength <= 3000) {
    lengthScore = 15;
  } else if (bodyLength >= 200 && bodyLength <= 5000) {
    lengthScore = 10;
  } else if (bodyLength > 0) {
    lengthScore = 5;
  }
  score += lengthScore;

  // Keyword analysis weight: 20%
  const bodyLower = story.body.toLowerCase();
  const titleLower = story.title.toLowerCase();
  const keywordMatches = VIRAL_KEYWORDS.filter(
    (keyword) =>
      bodyLower.includes(keyword.toLowerCase()) ||
      titleLower.includes(keyword.toLowerCase())
  ).length;
  const keywordScore = Math.min(20, keywordMatches * 4);
  score += keywordScore;

  // Title intensity weight: 10%
  const titleIntensityMatches = TITLE_INTENSITY_WORDS.filter((word) =>
    titleLower.includes(word.toLowerCase())
  ).length;
  const titleIntensityScore = Math.min(10, titleIntensityMatches * 3);
  score += titleIntensityScore;

  return Math.round(score);
}

/**
 * Assess retention risk for a story
 * Returns risk level and reasons
 */
export function getRetentionRisk(
  story: Story
): { level: "low" | "medium" | "high"; reasons: string[] } {
  const reasons: string[] = [];
  const bodyText = story.body || "";

  // Check for weak ending indicators
  if (
    bodyText.match(/\?\?+$/) ||
    bodyText.includes("update:") === false
  ) {
    reasons.push("May lack clear resolution");
  }

  // Check for confusing structure
  if (bodyText.length < 200) {
    reasons.push("Story may be too short for retention");
  }

  // Check for emotional payoff indicators
  const hasRevenge = VIRAL_KEYWORDS.some((kw) =>
    bodyText.toLowerCase().includes(kw)
  );
  if (!hasRevenge) {
    reasons.push("May lack satisfying revenge/karma payoff");
  }

  // Determine level based on reasons count
  let level: "low" | "medium" | "high" = "low";
  if (reasons.length >= 3) {
    level = "high";
  } else if (reasons.length >= 1) {
    level = "medium";
  }

  return { level, reasons };
}

/**
 * Check if story meets viral criteria
 */
export function meetsViralCriteria(story: Story): boolean {
  const upvotes = story.upvotes ?? story.score ?? 0;
  const commentCount = story.comment_count ?? story.num_comments ?? 0;
  const bodyText = story.body || "";

  // Must have at least 3k upvotes
  if (upvotes < 3000) return false;

  // Must have at least 200 comments
  if (commentCount < 200) return false;

  // Must have meaningful content
  if (bodyText.length < 300) return false;

  // Check keyword density
  const bodyLower = bodyText.toLowerCase();
  const keywordCount = VIRAL_KEYWORDS.filter((kw) =>
    bodyLower.includes(kw.toLowerCase())
  ).length;

  return keywordCount >= 2;
}

/**
 * Sort stories by viral score (descending)
 */
export function sortByViralScore(stories: Story[]): Story[] {
  return [...stories].sort((a, b) => {
    const scoreA = a.viral_score ?? calculateViralScore(a);
    const scoreB = b.viral_score ?? calculateViralScore(b);
    return scoreB - scoreA;
  });
}