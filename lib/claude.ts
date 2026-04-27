// ============================================================
// ENHANCED YOUTUBE CONTENT GENERATION SYSTEM
// Integrates: copywriting + content strategy + SEO + CRO principles
// ============================================================

import type { Story, YouTubeScript, YouTubePackage, VoiceStyle } from "@/types";
import { countWords } from "./utils";

// Use OpusMax API
const API_BASE_URL = process.env.OPUSMAX_BASE_URL || "https://api.opusmax.pro";
const API_KEY = process.env.OPUSMAX_API_KEY || "";

// ============================================================
// VIRAL CONTENT PROMPTS - Copywriting Principles
// ============================================================

const SCRIPT_SYSTEM_PROMPT = `You are a PROFESSIONAL YOUTUBE SCRIPTWRITER for a faceless storytelling channel. You write addictive, high-retention content that keeps viewers watching.

## COPYWRITING PRINCIPLES (CRITICAL)

1. **HOOK FORMULA**: Start with urgency + mystery + personal stakes
   - NEVER start with "Hey guys" or "Welcome back"
   - Start mid-conflict: "I was about to sign the papers when..." or "The CEO looked me in the eyes and said..."
   - First 5 seconds MUST create curiosity gap

2. **SUSPENSE LOOPS** (Every 20-30 seconds):
   - "But what they didn't know was..."
   - "This is where everything changed..."
   - "The moment I realized my revenge had just begun..."
   - "Everyone thought it was over. They were wrong."
   - "And then, the impossible happened..."

3. **RETENTION TRIGGERS**:
   - Pattern interrupts: "Wait. Before I tell you what happened, I need you to understand something."
   - Cliffhangers: End sections with unresolved tension
   - "I'll explain why this matters in a moment..."
   - "But first, let me tell you about the text that changed everything..."

4. **EMOTIONAL PACING**:
   - Build tension in conflict sections (slow down, more detail)
   - Quick pacing in revenge payoff (fast, punchy sentences)
   - Pause after key reveals (use "..." or parentheticals)
   - Contrast: quiet anger → sudden action

5. **POWER WORDS** (Use naturally):
   - Revenge: destroyed, obliterated, ruined, exposed, dismantled
   - Tension: secret, hidden, trapped, cornered, exposed
   - Payoff: satisfying, epic, ultimate, perfect, deserved

## CONTENT STRATEGY (Retention Engine)

6. **STRUCTURE RULES**:
   - HOOK (0:00-0:07): 2-3 sentences max. Start mid-action.
   - SETUP (0:07-0:40): Who you are. Why it matters. 1-2 short paragraphs.
   - CONFLICT (0:40-2:00): Antagonist introduced. Unfair treatment shown.
   - ESCALATION (2:00-4:30): 3+ incidents. Stakes increase. Suspense loops.
   - REVENGE (4:30-7:30): Step-by-step execution. SMART revenge (Specific, Measured, Achievable, Realistic, Timed).
   - OUTCOME (7:30-9:00): Consequences. Public shame? Legal trouble? Karma delivered?
   - CTA (9:00-10:00): Reinforce satisfaction. Optional twist ending.

7. **DOUBLE HOOK**: At 60-90 seconds, rehook viewers who almost clicked away.
   - "But here's what you don't know yet..."
   - "Before I show you how it ended, there's something I need to tell you..."

8. **MID-VIDEO TWIST**: Around 4:00 mark, add a revelation that changes perspective.

## WRITING STYLE

9. **SENTENCE STRUCTURE**:
   - Keep sentences under 20 words
   - Use periods liberally (viewer can process faster)
   - One idea per sentence
   - Action verbs, not passive voice

10. **TONE**: Conversational but dramatic. You are telling a friend a wild story.
    - Use "I" and "you" to create connection
    - Occasional rhetorical questions: "Can you imagine?"
    - React to story moments: "I couldn't believe it either"

11. **WHAT TO AVOID**:
    - Filler words: "so basically", "actually", "literally"
    - Long explanations of mundane details
    - Weak or uncertain language
    - Starting over or backtracking in narrative

## TARGET METRICS
- Word count: 900-1500 words
- Target duration: 5-10 minutes
- Watch time goal: 40%+ average
- CTR goal: 8%+

## OUTPUT FORMAT
Return JSON with EXACT structure:
{
  "hook": "Opening hook - 2-3 sentences starting mid-conflict (0:00-0:07)",
  "setup": "Context and character introduction (0:07-0:40)",
  "conflict": "Antagonist and unfair treatment (0:40-2:00)",
  "escalation": "Multiple incidents, increasing stakes, 3+ suspense loops (2:00-4:30)",
  "revenge": "Smart execution with step-by-step payoff (4:30-7:30)",
  "outcome": "Consequences and emotional closure (7:30-9:00)",
  "cta": "Reinforce satisfaction, optional twist (9:00-10:00)",
  "title": "Viral story title for video",
  "word_count": number
}`;

const PACKAGE_SYSTEM_PROMPT = `You are a YOUTUBE PACKAGING EXPERT for a faceless Reddit storytelling channel.

## SEO & VIRAL TITLE PRINCIPLES

1. **TITLE FORMULA** (5 variations required):
   - Type A: "My [Role] [Action]... So I [Revenge]"
     - Example: "My Boss Fired Me... So I Destroyed His Career"
   - Type B: "They Messed With Me... [Consequence]"
     - Example: "They Messed With the Wrong Person"
   - Type C: "[Number] Things [Antagonist] Did That [Payoff]"
     - Example: "5 Things My Ex Did That Destroyed Her Life"
   - Type D: "The Day I [Revenge Action]"
     - Example: "The Day I Ruined My Neighbor's Life"
   - Type E: "[Emotion] [Role] Reveals [Antagonist]'s [Secret]"
     - Example: "Angry Employee Exposes Manager's Dark Secret"

2. **TITLE RULES**:
   - Under 60 characters
   - Use "I", "They", "My" (personal connection)
   - Add tension with "..." or "BUT"
   - Include emotion: revenge, karma, destroyed, exposed, humiliated
   - Avoid: "story", "video", "watch", "video"

3. **THUMBNAIL TEXT** (Max 4-6 words):
   - Use CAPS for impact
   - Examples: "BIG MISTAKE", "INSTANT KARMA", "HE REGRETS IT", "DESTROYED", "WATCH THEM BURN"
   - Include number if applicable: "MISTAKE #7", "LEVEL 5 REVENGE"

4. **DESCRIPTION STRUCTURE**:
   - Line 1 (Hook): "This is the story of..." [1 sentence]
   - Lines 2-4 (Summary): What happened without giving away ending [2-3 sentences]
   - Line 5 (CTA): "Watch until the end to see..." [1 sentence]
   - Keywords naturally integrated (reddit stories, revenge, karma, pro revenge, justice)
   - Total: 150-250 words

5. **TAGS** (15-25 required):
   - Primary: reddit stories, revenge stories, karma, pro revenge, storytime, justice
   - Secondary: workplace revenge, entitled people, karma happens, reddit, true story
   - Long-tail: r/entitledpeople stories, malicious compliance, workplace drama
   - Include variations: "revenge story" AND "revenge stories"

6. **HASHTAGS** (5-8):
   - #redditstories #revenge #karma #storytime #viral #pro_revenge #justice #storytelling

7. **VOICE STYLE RECOMMENDATIONS**:
   - Accent: American neutral
   - Tone: Slightly dramatic, confident
   - Speed: 0.85-0.95 (slightly slower for drama)
   - Pauses: Natural pauses after reveals and key moments

8. **VISUAL PROMPTS** (for AI image generation):
   - Style: Paper/origami aesthetic, soft cinematic lighting, warm tones
   - Mix of: character reaction shots, environmental storytelling, close-ups on emotion
   - 1 prompt every 4-6 seconds
   - Include mood words: moody, cinematic, dramatic lighting, warm tones

## OUTPUT FORMAT
Return JSON:
{
  "titles": ["title1", "title2", "title3", "title4", "title5"],
  "thumbnail_text": "impact text in caps",
  "description": "full description paragraph",
  "tags": ["tag1", "tag2", ...],
  "hashtags": ["#hashtag1", "#hashtag2", ...],
  "voice_style": {
    "accent": "American neutral",
    "tone": "dramatic",
    "speed": 0.9,
    "pauses": true
  },
  "visual_prompts": [
    {"scene": 1, "timestamp": "0:00", "description": "...", "style": "moody cinematic..."},
    {"scene": 2, "timestamp": "0:15", "description": "...", "style": "..."},
    ...
  ]
}`;

// ============================================================
// API CALL FUNCTION
// ============================================================

async function callOpusMax(model: string, systemPrompt: string, userMessage: string, maxTokens: number = 4096): Promise<string> {
  // OpusMax doesn't support separate system messages - combine them
  const combinedMessage = `${systemPrompt}\n\n${userMessage}`;

  const response = await fetch(`${API_BASE_URL}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: "user", content: combinedMessage },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpusMax API error: ${error}`);
  }

  const data = await response.json();
  const content = data.content || [];

  let text = "";
  for (const item of content) {
    if (item.type === "text") {
      text += item.text;
    }
  }

  return text;
}

// ============================================================
// CONTENT QUALITY HELPERS
// ============================================================

const MAX_TITLE_LENGTH = 60;

/**
 * Trim title to max 60 chars while preserving meaning
 */
function trimTitle(title: string): string {
  if (title.length <= MAX_TITLE_LENGTH) return title;

  // Try to cut at natural break points
  const breakpoints = ["... ", " — ", " - ", ". ", ".."];
  for (const bp of breakpoints) {
    const idx = title.lastIndexOf(bp, MAX_TITLE_LENGTH);
    if (idx > MAX_TITLE_LENGTH - 20) {
      return title.substring(0, idx).trim();
    }
  }

  // Fallback: cut at last space before limit
  const lastSpace = title.lastIndexOf(" ", MAX_TITLE_LENGTH);
  if (lastSpace > MAX_TITLE_LENGTH - 15) {
    return title.substring(0, lastSpace).trim();
  }

  // Last resort: hard cut
  return title.substring(0, MAX_TITLE_LENGTH - 3) + "...";
}

/**
 * Check if hook starts with weak opener
 */
function isWeakHook(hook: string): boolean {
  const lower = hook.toLowerCase().trim();
  const weakStarters = [
    "hey", "hi", "hello", "welcome", "what's up", "yo",
    "today i", "in this video", "welcome back", "guys",
    "so basically", "so this", "let me tell", "i want to",
  ];
  return weakStarters.some(s => lower.startsWith(s));
}

// ============================================================
// SCRIPT GENERATION
// ============================================================

export async function generateScript(story: Story): Promise<YouTubeScript> {
  const userMessage = `Create a YouTube script for this Reddit story:

TITLE: ${story.title}
AUTHOR: ${story.author}
SUBREDDIT: r/${story.subreddit || "unknown"}
UPVOTES: ${(story.upvotes ?? 0).toLocaleString()}
COMMENTS: ${(story.comment_count ?? 0).toLocaleString()}

STORY:
${story.body}

Generate a complete, engaging YouTube script following ALL the copywriting principles and structure rules. Make it dramatic, suspenseful, and emotionally satisfying. Return ONLY JSON.`;

  const response = await callOpusMax("claude-sonnet-4-6", SCRIPT_SYSTEM_PROMPT, userMessage, 8192);
  return parseScriptResponse(response, story);
}

function parseScriptResponse(response: string, story: Story): YouTubeScript {
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      const content = Object.values(parsed).filter(v => typeof v === "string").join("\n\n");
      const wordCount = countWords(content);

      // Extract and validate hook
      let hook = parsed.hook || "This story changed everything...";
      // Auto-fix weak hooks by prepending tension
      if (isWeakHook(hook)) {
        hook = "Everything was about to change... " + hook;
      }

      return {
        hook,
        setup: parsed.setup || "",
        conflict: parsed.conflict || "",
        escalation: parsed.escalation || "",
        revenge: parsed.revenge || "",
        outcome: parsed.outcome || "",
        cta: parsed.cta || "",
        content,
        title: parsed.title || story.title,
        timestamps: [
          { time: "0:00", label: "HOOK", description: "Opening hook" },
          { time: "0:07", label: "SETUP", description: "Context setting" },
          { time: "0:40", label: "CONFLICT", description: "Antagonist introduced" },
          { time: "2:00", label: "ESCALATION", description: "Stakes increase" },
          { time: "4:30", label: "REVENGE", description: "The payoff" },
          { time: "7:30", label: "OUTCOME", description: "Resolution" },
          { time: "9:00", label: "CTA", description: "Call to action" },
        ],
        word_count: wordCount,
        estimated_duration: Math.round(wordCount / 150 * 60),
      };
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback
  const wordCount = countWords(response);
  return {
    hook: "This is one of the most satisfying stories you'll ever hear...",
    setup: "",
    conflict: "",
    escalation: response,
    revenge: "",
    outcome: "",
    cta: "",
    content: response,
    title: story.title,
    timestamps: [],
    word_count: wordCount,
    estimated_duration: Math.round(wordCount / 150 * 60),
  };
}

// ============================================================
// PACKAGE GENERATION
// ============================================================

export async function generateYouTubePackage(
  story: Story,
  script: YouTubeScript
): Promise<YouTubePackage> {
  const userMessage = `Create a YouTube package for this story:

TITLE: ${story.title}
SCRIPT PREVIEW: ${(script.content || "").substring(0, 3000)}...

Generate optimized YouTube metadata following ALL the SEO and viral principles. Return ONLY JSON.
IMPORTANT: All titles MUST be under 60 characters. Use short, punchy titles.`;

  try {
    const response = await callOpusMax("claude-sonnet-4-6", PACKAGE_SYSTEM_PROMPT, userMessage, 4096);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // Auto-trim all titles to 60 chars
      const trimmedTitles = (parsed.titles || [
        story.title,
        `The Story That Broke The Internet`,
        `You Won't Believe What Happened Next`,
      ]).map(t => trimTitle(t));

      return {
        titles: trimmedTitles,
        thumbnail_text: parsed.thumbnail_text || "BIG MISTAKE",
        description: parsed.description || `This incredible story will shock you. Watch to find out what happened...`,
        tags: parsed.tags || ["reddit stories", "revenge stories", "karma", "pro revenge", "storytime", "viral stories"],
        hashtags: parsed.hashtags || ["#redditstories", "#revenge", "#karma", "#storytime", "#viralstories"],
        voice_style: parsed.voice_style || { accent: "American neutral", tone: "slightly dramatic", speed: 0.9, pauses: true },
        visual_prompts: parsed.visual_prompts || [],
        script,
      };
    }
  } catch (error) {
    console.error("Failed to generate YouTube package:", error);
  }

  // Fallback
  return {
    titles: [story.title, `The Story That Broke The Internet`, `You Won't Believe What Happened Next`].map((t: string) => trimTitle(t)),
    thumbnail_text: "BIG MISTAKE",
    description: `This incredible story will shock you. Watch to find out what happened...`,
    tags: ["reddit stories", "revenge stories", "karma", "pro revenge", "storytime", "viral stories"],
    hashtags: ["#redditstories", "#revenge", "#karma", "#storytime", "#viralstories"],
    voice_style: { accent: "American neutral", tone: "slightly dramatic", speed: 0.9, pauses: true },
    visual_prompts: [],
    script,
  };
}

// ============================================================
// CONTENT VALIDATION (Post-Generation Quality Check)
// ============================================================

export interface ContentValidation {
  hook_score: number; // 0-100
  title_scores: number[];
  tag_count_ok: boolean;
  issues: string[];
}

export function validateContent(script: YouTubeScript, pkg: YouTubePackage): ContentValidation {
  const issues: string[] = [];
  const title_scores: number[] = [];

  // Hook score (0-100) - improved scoring
  let hook_score = 70; // Start higher since weak hooks are auto-fixed

  // Check for strong patterns (bonuses)
  const hook_lower = script.hook.toLowerCase();

  if (hook_lower.includes("...") || hook_lower.includes("but") || hook_lower.includes("when")) {
    hook_score += 15; // Has tension markers
  }
  if (hook_lower.includes("didn't know") || hook_lower.includes("didn't expect") || hook_lower.includes("what")) {
    hook_score += 10; // Has mystery/certainty gap
  }
  if (script.hook.length < 150) {
    hook_score += 10; // Concise hooks perform better
  }
  if (hook_lower.startsWith("everything") || hook_lower.startsWith("the moment") || hook_lower.startsWith("they")) {
    hook_score += 10; // Strong action openings
  }

  // Title scoring
  for (const title of pkg.titles) {
    let score = 65;

    // Check character count (should be fine since we auto-trim)
    if (title.length > 60) {
      score -= 15;
      issues.push(`Title too long: "${title.substring(0, 40)}..." (${title.length} chars)`);
    }

    // Check for personal connection
    if (title.includes("I ") || title.includes("My ") || title.includes("They ") || title.includes("The ")) {
      score += 15;
    }

    // Power words that boost viral potential
    const powerWords = [
      "destroyed", "ruined", "exposed", "karma", "revenge",
      "regrets", "mistake", "obliterated", "secret", "filled"
    ];
    if (powerWords.some((w) => title.toLowerCase().includes(w))) {
      score += 15;
    }

    // Check for tension markers
    if (title.includes("...") || title.includes("BUT") || title.includes("So I")) {
      score += 10;
    }

    title_scores.push(Math.min(100, Math.max(0, score)));
  }

  // Tag count check
  const tag_count_ok = pkg.tags.length >= 15 && pkg.tags.length <= 25;
  if (!tag_count_ok) {
    issues.push(`Tag count: ${pkg.tags.length} (should be 15-25)`);
  }

  return {
    hook_score: Math.min(100, Math.max(0, hook_score)),
    title_scores,
    tag_count_ok,
    issues,
  };
}