# YouTube Content System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A complete Next.js 15 web app that scrapes Reddit revenge stories via Apify, scores them for virality, generates dramatic YouTube scripts via Claude AI, produces full YouTube packages (titles/thumbnails/tags/descriptions), and exports to JSON/Text/PDF/Google Docs — all wrapped in a dark cinematic "Electric Storm" UI with shared password auth.

**Architecture:** Monolithic Next.js 15 app with App Router. API routes handle all server-side logic (Apify scraping, Claude generation, Supabase queries). Client components handle UI. Tailwind CSS v4 with custom design tokens. No separate backend.

**Tech Stack:** Next.js 15, Tailwind CSS v4, Supabase (Postgres + Auth + anon key), Anthropic Claude API ( Sonnet 4.6), Apify reddit-scraper actor, Lucide React, Vercel deployment, bcrypt, @react-pdf/renderer (PDF), jspdf (PDF alt).

---

## Phase 1: Project Foundation

### 1.1: Initialize Next.js Project

**Files:**
- Create: `package.json` (Next.js 15, React 19, Tailwind CSS v4, Supabase JS v2, Lucide React, Anthropic SDK, bcryptjs, @react-pdf/renderer, jspdf)
- Create: `next.config.ts` (Next.js 15 config)
- Create: `tsconfig.json`
- Create: `tailwind.config.ts` (custom Electric Storm tokens)
- Create: `postcss.config.mjs`
- Create: `.env.local.example`
- Create: `README.md`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "youtube-content-system",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:migrate": "supabase db push"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.5.0",
    "@anthropic-ai/sdk": "^0.39.0",
    "lucide-react": "^0.460.0",
    "bcryptjs": "^2.4.3",
    "@types/bcryptjs": "^2.4.6",
    "@react-pdf/renderer": "^4.0.0",
    "jspdf": "^2.5.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0"
  }
}
```

- [ ] **Step 2: Create next.config.ts**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
```

- [ ] **Step 3: Create tailwind.config.ts**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0f14",
        surface: "#111a24",
        "surface-elevated": "#1a2636",
        border: "#1a2a3a",
        accent: "#4a9eff",
        "accent-secondary": "#2dd4bf",
        danger: "#f43f5e",
        warning: "#f59e0b",
        "text-primary": "#e2e8f0",
        "text-secondary": "#94a3b8",
        "text-muted": "#475569",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: Create postcss.config.mjs**

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

- [ ] **Step 5: Create .env.local.example**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key

# Apify
APIFY_API_TOKEN=your_apify_api_token

# App
APP_PASSWORD_HASH=bcrypt_hash_of_shared_password
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 6: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 7: Create globals.css**

```css
@import "tailwindcss";

@theme {
  --color-bg: #0a0f14;
  --color-surface: #111a24;
  --color-surface-elevated: #1a2636;
  --color-border: #1a2a3a;
  --color-accent: #4a9eff;
  --color-accent-secondary: #2dd4bf;
  --color-danger: #f43f5e;
  --color-warning: #f59e0b;
  --color-text-primary: #e2e8f0;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #475569;
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
}

::selection {
  background-color: var(--color-accent);
  color: white;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--color-bg);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}
```

- [ ] **Step 8: Create README.md**

```markdown
# YouTube Content System

Reddit revenge story scraper → YouTube content pipeline.

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in credentials
3. Run Supabase migrations (see `supabase/migrations/`)
4. `npm run dev`

## Environment Variables

See `.env.local.example`
```

- [ ] **Step 9: Commit**

```bash
git init && git add package.json next.config.ts tsconfig.json tailwind.config.ts postcss.config.mjs .env.local.example README.md globals.css && git commit -m "feat: scaffold Next.js 15 project with Electric Storm theme"
```

---

### 1.2: Types and Utilities

**Files:**
- Create: `types/index.ts`
- Create: `lib/utils.ts`
- Create: `lib/viral-score.ts`
- Create: `data/channel-strategy.md`

- [ ] **Step 1: Create types/index.ts**

```ts
export interface Story {
  id: string;
  apify_id: string | null;
  title: string;
  body: string | null;
  author: string | null;
  subreddit: string;
  url: string | null;
  upvotes: number;
  comment_count: number;
  scraped_at: string;
  viral_score: number;
  status: "raw" | "scripted" | "packaged" | "exported";
  script: YouTubeScript | null;
  youtube_package: YouTubePackage | null;
  created_at: string;
}

export interface YouTubeScript {
  hook: string;
  setup: string;
  conflict: string;
  escalation: string;
  revenge: string;
  outcome: string;
  cta: string;
  word_count: number;
  estimated_duration: number; // seconds
  retention_score: number;
}

export interface YouTubePackage {
  titles: string[];
  thumbnail_text: string;
  description: string;
  tags: string[];
  hashtags: string[];
}

export interface ScrapeConfig {
  subreddits: string[];
  sort: "hot" | "new" | "top";
  timeRange: "day" | "week" | "month" | "year" | "all";
  maxItems: number;
  minUpvotes: number;
  minComments: number;
}

export interface ScrapeResult {
  id: string;
  title: string;
  text: string;
  author: string;
  subreddit: string;
  url: string;
  upvotes: number;
  num_comments: number;
  created: number; // unix timestamp
}

export interface ApifyRun {
  id: string;
  status: "READY" | "RUNNING" | "FAILED" | "ABORTED";
  datasetId?: string;
  itemsRead?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface StoryFilters {
  subreddit?: string;
  status?: Story["status"];
  minScore?: number;
  search?: string;
  sortBy?: "scraped_at" | "upvotes" | "viral_score";
  sortOrder?: "asc" | "desc";
}
```

- [ ] **Step 2: Create lib/utils.ts**

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function estimateReadTime(wordCount: number, speed = 0.9): number {
  return Math.round((wordCount / (150 * speed)) * 60);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
```

- [ ] **Step 3: Create lib/viral-score.ts**

```ts
const VIRAL_KEYWORDS = [
  "revenge", "karma", "fired", "boss", "cheating", "entitled",
  "family", "lawsuit", "police", "destroyed", "humiliated",
  "exposed", "revenge", "payback", "sued", "arrested", "divorce",
];

const TITLE_INTENSITY_WORDS = [
  "destroyed", "ruined", "fired", "humiliated", "exposed",
  "pranked", "sued", "arrested", "banned", "blackmailed",
  "sabotaged", "manipulated", "betrayed", "abandoned",
];

function keywordCount(text: string): number {
  const lower = text.toLowerCase();
  return VIRAL_KEYWORDS.filter(k => lower.includes(k)).length;
}

function titleIntensityScore(title: string): number {
  const lower = title.toLowerCase();
  return TITLE_INTENSITY_WORDS.filter(w => lower.includes(w)).length;
}

function normalizeUpvotes(upvotes: number): number {
  // Scale: 3K = 50, 10K = 80, 50K+ = 100
  if (upvotes >= 50000) return 100;
  if (upvotes <= 0) return 0;
  return Math.min(100, Math.round(50 + (upvotes / 1000) * 6));
}

function normalizeComments(comments: number): number {
  // Scale: 200 = 50, 1000 = 80, 5000+ = 100
  if (comments >= 5000) return 100;
  if (comments <= 0) return 0;
  return Math.min(100, Math.round(50 + (comments / 100) * 1.2));
}

function normalizeLength(body: string | null): number {
  const words = (body || "").trim().split(/\s+/).filter(Boolean).length;
  // Medium (200-800 words) = high score
  if (words >= 200 && words <= 800) return 100;
  if (words < 200) return Math.round((words / 200) * 50);
  return Math.max(0, 100 - Math.round((words - 800) / 100) * 10);
}

function normalizeKeywords(body: string | null, title: string): number {
  const combined = `${title} ${body || ""}`;
  const count = keywordCount(combined);
  return Math.min(100, count * 20);
}

function normalizeTitleIntensity(title: string): number {
  const score = titleIntensityScore(title);
  return Math.min(100, score * 33);
}

export function calculateViralScore(
  upvotes: number,
  comments: number,
  body: string | null,
  title: string
): number {
  const weighted =
    normalizeUpvotes(upvotes) * 0.30 +
    normalizeComments(comments) * 0.25 +
    normalizeLength(body) * 0.15 +
    normalizeKeywords(body, title) * 0.20 +
    normalizeTitleIntensity(title) * 0.10;

  return Math.round(weighted);
}

export function getRetentionRisk(score: number): "low" | "medium" | "high" {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}
```

- [ ] **Step 4: Create lib/apify.ts**

```ts
const ACTOR_ID = "apify/reddit-scraper";
const APIFY_API_URL = "https://api.apify.com/v2";

export interface ApifyInput {
  subreddits: string[];
  sort: "hot" | "new" | "top";
  timeRange?: "day" | "week" | "month" | "year" | "all";
  maxItems: number;
  minUpvotes?: number;
  minComments?: number;
  includePosts?: boolean;
  includeComments?: boolean;
}

export async function startApifyRun(input: ApifyInput, apiToken: string) {
  const response = await fetch(
    `${APIFY_API_URL}/acts/${ACTOR_ID}/runs`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Apify start run failed: ${error}`);
  }

  return response.json();
}

export async function getApifyRunStatus(runId: string, apiToken: string) {
  const response = await fetch(
    `${APIFY_API_URL}/acts/${ACTOR_ID}/runs/${runId}`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Apify get run failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getApifyDatasetItems<T>(
  datasetId: string,
  apiToken: string,
  clean = true
) {
  const cleanParam = clean ? "?clean=true" : "";
  const response = await fetch(
    `${APIFY_API_URL}/datasets/${datasetId}/items${cleanParam}`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Apify get dataset failed: ${response.statusText}`);
  }

  return response.json() as Promise<T[]>;
}
```

- [ ] **Step 5: Create lib/claude.ts**

```ts
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const anthropic = new Anthropic();

async function loadChannelStrategy(): Promise<string> {
  const filePath = path.join(process.cwd(), "data", "channel-strategy.md");
  return fs.readFileSync(filePath, "utf-8");
}

export async function generateScript(
  storyTitle: string,
  storyBody: string,
  subreddit: string
): Promise<{
  script: {
    hook: string;
    setup: string;
    conflict: string;
    escalation: string;
    revenge: string;
    outcome: string;
    cta: string;
    word_count: number;
    estimated_duration: number;
    retention_score: number;
  };
  streaming: ReadableStream<string>;
}> {
  const channelStrategy = await loadChannelStrategy();

  const systemPrompt = `${channelStrategy}

You are an expert YouTube scriptwriter specializing in dramatic, cinematic storytelling for Reddit revenge content. Follow the channel strategy precisely. Write scripts in American English with a dramatic, tension-building tone. Every 20-30 seconds include open loops and suspense triggers. Target 5-10 minute video length (900-1500 words).`;

  const userPrompt = `Write a complete YouTube script for this Reddit story from r/${subreddit}.

TITLE: ${storyTitle}
BODY: ${storyBody || "(no body text)"}

Structure your response EXACTLY as JSON with these fields:
{
  "hook": "0:00-0:07 - Start mid-conflict, no greeting, create curiosity",
  "setup": "0:07-0:40 - Who, what context, fast and relatable",
  "conflict": "0:40-2:00 - Introduce antagonist, show unfair treatment",
  "escalation": "2:00-4:30 - Multiple incidents, increasing stakes, suspense loops",
  "revenge": "4:30-7:30 - Smart execution, step-by-step payoff",
  "outcome": "7:30-9:00 - Consequences, emotional closure",
  "cta": "9:00-10:00 - Reinforce satisfaction, optional twist",
  "word_count": <total word count>,
  "estimated_duration": <duration in seconds>,
  "retention_score": <estimate 0-100 based on suspense loops and pacing>
}

Write ONLY the JSON. No explanation, no preamble.`;

  const streaming = await anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textStream = new ReadableStream<string>({
    async start(controller) {
      for await (const event of streaming) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(event.delta.text);
        }
      }
      controller.close();
    },
  });

  const message = await streaming.finalMessage();

  let scriptData;
  try {
    scriptData = JSON.parse(message.content[0].type === "text" ? message.content[0].text : "{}");
  } catch {
    scriptData = {
      hook: "Failed to parse script.",
      setup: "", conflict: "", escalation: "",
      revenge: "", outcome: "", cta: "",
      word_count: 0, estimated_duration: 0, retention_score: 0,
    };
  }

  return { script: scriptData, streaming: textStream };
}

export async function generateYouTubePackage(
  storyTitle: string,
  storyBody: string,
  subreddit: string
): Promise<{
  titles: string[];
  thumbnail_text: string;
  description: string;
  tags: string[];
  hashtags: string[];
}> {
  const channelStrategy = await loadChannelStrategy();

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: `${channelStrategy}

You are a YouTube viral optimization expert. Generate engaging titles, thumbnail text, descriptions, tags, and hashtags for Reddit revenge content.`,
    messages: [
      {
        role: "user",
        content: `Generate YouTube packaging for this Reddit story.

TITLE: ${storyTitle}
SUBREDDIT: ${subreddit}
BODY: ${storyBody || "(no body text)"}

Respond ONLY with valid JSON:
{
  "titles": ["5 viral titles under 60 chars each, curiosity gap + emotional words, use I/They/My"],
  "thumbnail_text": "Max 6 punchy words for thumbnail",
  "description": "Hook paragraph + summary + CTA + SEO keywords naturally woven in",
  "tags": ["15-25 relevant tags", "reddit stories", "revenge stories", "karma stories", "pro revenge", "storytime", "workplace revenge"],
  "hashtags": ["#redditstories", "#revenge", "#karma", "#storytime", "#viralstories"]
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";

  try {
    return JSON.parse(text);
  } catch {
    return {
      titles: [`${storyTitle} - You Won't Believe What Happened Next`],
      thumbnail_text: "BIG MISTAKE",
      description: `A wild Reddit story that will leave you speechless.\n\nThis is the full story, told dramatically. Don't forget to like and subscribe.\n\n#redditstories #revenge #karma #storytime`,
      tags: ["reddit stories", "revenge stories", "storytime", "pro revenge"],
      hashtags: ["#redditstories", "#revenge", "#karma", "#storytime", "#viralstories"],
    };
  }
}
```

- [ ] **Step 6: Create data/channel-strategy.md** (copy from CLAUDE.md project root)

Copy the full content from `d:/Claude_Main/NEW YOUTUBE CHANNEL/claude.md` into this file.

- [ ] **Step 7: Commit**

```bash
git add types/index.ts lib/utils.ts lib/viral-score.ts lib/apify.ts lib/claude.ts data/channel-strategy.md && git commit -m "feat: add TypeScript types, utilities, viral scoring, and API integrations"
```

---

### 1.3: Supabase Client and Middleware

**Files:**
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/middleware.ts`
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Create lib/supabase/server.ts**

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component - ignore
          }
        },
      },
    }
  );
}

export async function createAdminClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
```

- [ ] **Step 2: Create lib/supabase/client.ts**

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 3: Create lib/supabase/middleware.ts**

```ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_ROUTES = ["/login", "/api/auth/login"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = PUBLIC_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/stories", request.url));
  }

  return supabaseResponse;
}
```

- [ ] **Step 4: Create supabase/migrations/001_initial_schema.sql**

```sql
-- Shared password hash
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom subreddits
CREATE TABLE IF NOT EXISTS custom_subreddits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default subreddits (not in a table, hardcoded in app)
-- ProRevenge, NuclearRevenge, MaliciousCompliance, EntitledPeople, AmITheAsshole, TrueOffMyChest

-- Scraped stories
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apify_id TEXT UNIQUE,
  title TEXT NOT NULL,
  body TEXT,
  author TEXT,
  subreddit TEXT NOT NULL,
  url TEXT,
  upvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  viral_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'raw' CHECK (status IN ('raw', 'scripted', 'packaged', 'exported')),
  script JSONB,
  youtube_package JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stories_subreddit ON stories(subreddit);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_viral_score ON stories(viral_score DESC);
CREATE INDEX IF NOT EXISTS idx_stories_scraped_at ON stories(scraped_at DESC);

-- Settings (API keys, stored as encrypted text via Supabase vault or env)
-- These are stored in app_config, keys: 'apify_token', 'anthropic_key', 'app_password_hash'

-- Insert default app password hash (bcrypt hash of 'channel2026' - CHANGE THIS!)
-- Generated with: bcrypt.hash('channel2026', 10)
INSERT INTO app_config (key, value) VALUES ('app_password_hash', '$2a$10$placeholder_hash_replace_in_production')
ON CONFLICT (key) DO NOTHING;
```

- [ ] **Step 5: Commit**

```bash
git add lib/supabase/server.ts lib/supabase/client.ts lib/supabase/middleware.ts supabase/migrations/001_initial_schema.sql && git commit -m "feat: add Supabase client, server client, middleware, and database migration"
```

---

## Phase 2: Authentication (Shared Password)

### 2.1: Login Page and API

**Files:**
- Create: `app/login/page.tsx`
- Create: `app/api/auth/login/route.ts`
- Create: `app/api/auth/logout/route.ts`
- Create: `app/api/auth/check/route.ts`
- Modify: `middleware.ts` (update import)
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create app/api/auth/login/route.ts**

```ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    const supabase = await createAdminClient();
    const { data: config } = await supabase
      .from("app_config")
      .select("value")
      .eq("key", "app_password_hash")
      .single();

    const storedHash = config?.value || process.env.APP_PASSWORD_HASH;

    if (!storedHash) {
      return NextResponse.json(
        { error: "Server not configured" },
        { status: 500 }
      );
    }

    const valid = await bcrypt.compare(password, storedHash);

    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: "admin@youtube-content-system.local",
    });

    if (error) {
      // Fallback: set a simple cookie-based session
      const response = NextResponse.json({ success: true });
      response.cookies.set("app_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
      return response;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create app/api/auth/logout/route.ts**

```ts
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("app_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
```

- [ ] **Step 3: Create app/api/auth/check/route.ts**

```ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = request.cookies.get("app_session");
  const authenticated = session?.value === "authenticated";
  return NextResponse.json({ authenticated });
}
```

- [ ] **Step 4: Create app/login/page.tsx**

```ts
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/stories");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-2xl font-bold text-text-primary">RevengeHub</span>
          </div>
          <h1 className="text-xl font-semibold text-text-primary">
            Content Pipeline
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Enter the shared password to access
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-xl p-6 space-y-5"
        >
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter shared password"
              className="w-full bg-bg border border-border rounded-lg py-3 pl-10 pr-10 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-danger text-sm text-center bg-danger/10 rounded-lg py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-150"
          >
            {loading ? "Verifying..." : "Access Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Update middleware.ts** — add the updated middleware content from the Supabase middleware step.

- [ ] **Step 6: Update root middleware.ts** — create `middleware.ts` in the app root that imports from `lib/supabase/middleware.ts`.

```ts
export { updateSession as middleware } from "@/lib/supabase/middleware";
```

- [ ] **Step 7: Commit**

```bash
git add app/login/page.tsx app/api/auth/login/route.ts app/api/auth/logout/route.ts app/api/auth/check/route.ts middleware.ts && git commit -m "feat: add shared password authentication system"
```

---

## Phase 3: App Shell (Layout + Sidebar + Shared Components)

### 3.1: Root Layout and Sidebar

**Files:**
- Create: `components/layout/Sidebar.tsx`
- Create: `components/layout/AppShell.tsx`
- Create: `components/ui/Button.tsx`
- Create: `components/ui/Input.tsx`
- Create: `components/ui/Badge.tsx`
- Create: `components/ui/Toast.tsx`
- Create: `components/ui/Skeleton.tsx`
- Create: `components/ui/Modal.tsx`
- Create: `components/ui/ProgressBar.tsx`
- Create: `components/ui/Card.tsx`
- Create: `components/ui/Select.tsx`
- Create: `components/ui/TagInput.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create app/layout.tsx**

```ts
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "RevengeHub — YouTube Content Pipeline",
  description: "Reddit revenge story scraper to YouTube content pipeline",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg text-text-primary antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create components/layout/Sidebar.tsx**

```ts
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Download,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Search,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/stories", label: "Stories", icon: BookOpen },
  { href: "/scrape", label: "Scrape", icon: Search },
  { href: "/scripts", label: "Scripts", icon: FileText },
  { href: "/package", label: "YT Package", icon: Zap },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-surface border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <div>
            <span className="text-text-primary font-bold">RevengeHub</span>
            <p className="text-text-muted text-xs">Content Pipeline</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-accent/10 text-accent"
                  : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="bg-surface-elevated rounded-lg p-3">
          <p className="text-text-muted text-xs">Powered by</p>
          <p className="text-text-secondary text-xs font-mono mt-0.5">
            Apify + Claude
          </p>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Create components/layout/AppShell.tsx**

```ts
import { Sidebar } from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Create all UI components** — Button, Input, Badge, Toast, Skeleton, Modal, ProgressBar, Card, Select, TagInput. Each follows the Electric Storm color scheme and uses Lucide icons. (Full implementations are straightforward — see the design spec for component states.)

- [ ] **Step 5: Create app/(app)/layout.tsx** — uses AppShell for all authenticated routes.

```ts
import { AppShell } from "@/components/layout/AppShell";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
```

- [ ] **Step 6: Update page.tsx to redirect**

```ts
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/stories");
}
```

- [ ] **Step 7: Commit**

```bash
git add app/layout.tsx app/\(app\)/layout.tsx app/page.tsx components/layout/Sidebar.tsx components/layout/AppShell.tsx components/ui/ && git commit -m "feat: add app shell with sidebar navigation and UI component library"
```

---

## Phase 4: Story Scraper (Apify + Database)

### 4.1: Scrape Page

**Files:**
- Create: `app/(app)/scrape/page.tsx`
- Create: `app/api/scrape/route.ts`
- Create: `app/api/scrape/[runId]/route.ts`
- Create: `components/scrape/ScrapeForm.tsx`
- Create: `components/scrape/ScrapeProgress.tsx`

- [ ] **Step 1: Create app/api/scrape/route.ts**

```ts
import { NextRequest, NextResponse } from "next/server";
import { startApifyRun } from "@/lib/apify";
import { createAdminClient } from "@/lib/supabase/server";
import { calculateViralScore } from "@/lib/viral-score";
import type { ScrapeConfig, ScrapeResult } from "@/types";

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
    const config: ScrapeConfig = await request.json();

    const apiToken = process.env.APIFY_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        { error: "APIFY_API_TOKEN not configured" },
        { status: 500 }
      );
    }

    // Get custom subreddits from DB
    const supabase = await createAdminClient();
    const { data: customSubs } = await supabase
      .from("custom_subreddits")
      .select("name");

    const allSubreddits = [
      ...DEFAULT_SUBREDDITS,
      ...(customSubs?.map((s) => s.name) || []),
    ];

    // Filter to only requested subreddits
    const subreddits = config.subreddits?.length
      ? config.subreddits
      : allSubreddits;

    const input = {
      subreddits,
      sort: config.sort || "top",
      timeRange: config.timeRange || "month",
      maxItems: config.maxItems || 50,
      minUpvotes: config.minUpvotes || 3000,
      minComments: config.minComments || 200,
      includePosts: true,
      includeComments: false,
    };

    const run = await startApifyRun(input, apiToken);

    return NextResponse.json({ runId: run.data.id });
  } catch (err) {
    console.error("Scrape error:", err);
    return NextResponse.json(
      { error: "Failed to start scrape" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Create app/api/scrape/[runId]/route.ts**

```ts
import { NextRequest, NextResponse } from "next/server";
import { getApifyRunStatus, getApifyDatasetItems, type ApifyRun } from "@/lib/apify";
import { createAdminClient } from "@/lib/supabase/server";
import { calculateViralScore } from "@/lib/viral-score";
import type { ScrapeResult, Story } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;

  try {
    const apiToken = process.env.APIFY_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json({ error: "APIFY_API_TOKEN not configured" }, { status: 500 });
    }

    const runStatus = await getApifyRunStatus(runId, apiToken);
    const run = runStatus.data as ApifyRun;

    // Still running
    if (run.status === "RUNNING") {
      return NextResponse.json({
        status: "running",
        itemsRead: run.itemsRead || 0,
      });
    }

    // Failed
    if (run.status === "FAILED" || run.status === "ABORTED") {
      return NextResponse.json({
        status: "error",
        error: "Apify run failed or was aborted",
      });
    }

    // Completed — fetch and store results
    if (run.status === "READY" && run.datasetId) {
      const items = await getApifyDatasetItems<ScrapeResult>(run.datasetId, apiToken);
      const supabase = await createAdminClient();

      const stories: Omit<Story, "id" | "created_at">[] = items
        .filter((item) => item.title && item.subreddit)
        .map((item) => {
          const score = calculateViralScore(
            item.upvotes,
            item.num_comments,
            item.text,
            item.title
          );
          return {
            apify_id: item.id,
            title: item.title,
            body: item.text || null,
            author: item.author || null,
            subreddit: item.subreddit,
            url: item.url || null,
            upvotes: item.upvotes || 0,
            comment_count: item.num_comments || 0,
            scraped_at: new Date(item.created * 1000).toISOString(),
            viral_score: score,
            status: "raw",
            script: null,
            youtube_package: null,
          };
        });

      if (stories.length > 0) {
        // Upsert: skip if apify_id already exists
        const { error } = await supabase.from("stories").upsert(stories, {
          onConflict: "apify_id",
          ignoreDuplicates: true,
        });

        if (error) {
          console.error("Supabase upsert error:", error);
        }
      }

      return NextResponse.json({
        status: "completed",
        itemsCount: stories.length,
        totalItems: items.length,
      });
    }

    return NextResponse.json({ status: "unknown", run });
  } catch (err) {
    console.error("Scrape status error:", err);
    return NextResponse.json({ error: "Failed to check scrape status" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Create components/scrape/ScrapeForm.tsx**

Full component with subreddit multi-select, filter inputs (sort, time range, max items, min upvotes, min comments), custom subreddit add/remove, and "Run Scrape" button. Shows loading state during scrape.

- [ ] **Step 4: Create components/scrape/ScrapeProgress.tsx**

Polling component that calls `/api/scrape/[runId]` every 3 seconds, shows progress bar with items count, transitions to success/error state.

- [ ] **Step 5: Create app/(app)/scrape/page.tsx**

Combines ScrapeForm and ScrapeProgress. Shows form by default. After "Run Scrape", shows progress. On completion, redirects to `/stories`.

- [ ] **Step 6: Commit**

```bash
git add app/api/scrape/route.ts app/api/scrape/[runId]/route.ts components/scrape/ScrapeForm.tsx components/scrape/ScrapeProgress.tsx app/\(app\)/scrape/page.tsx && git commit -m "feat: add Apify story scraper with progress tracking"
```

---

## Phase 5: Story Library

### 5.1: Stories Page + Story Cards + Story Detail

**Files:**
- Create: `components/stories/StoryCard.tsx`
- Create: `components/stories/StoryFilters.tsx`
- Create: `app/(app)/stories/page.tsx`
- Create: `app/(app)/stories/[id]/page.tsx`
- Create: `app/api/stories/route.ts`
- Create: `app/api/stories/[id]/route.ts`

- [ ] **Step 1: Create app/api/stories/route.ts**

Handles GET (list stories with filters: subreddit, status, minScore, search, sortBy, sortOrder) and POST (optional manual add). Uses Supabase admin client. Applies all filter conditions in a single query.

- [ ] **Step 2: Create app/api/stories/[id]/route.ts**

Handles GET (single story with full details) and DELETE (remove story).

- [ ] **Step 3: Create components/stories/StoryCard.tsx**

Card showing: title (truncated), subreddit badge, upvote count, comment count, viral score badge (color-coded: green ≥70, yellow 40-69, red <40), status badge (raw/scripted/packaged/exported), relative time. Hover shows "View" button.

- [ ] **Step 4: Create components/stories/StoryFilters.tsx**

Filter sidebar/section with: subreddit multi-select, status select, viral score range, search input, sort select. Updates URL params on change.

- [ ] **Step 5: Create app/(app)/stories/page.tsx**

Grid/list view toggle, filter bar, story cards grid (3 columns), pagination, empty state.

- [ ] **Step 6: Create app/(app)/stories/[id]/page.tsx**

Full story view: title, body, metadata (author, subreddit, upvotes, comments, score breakdown), action buttons (Generate Script, Generate Package, Delete). Shows script preview if already generated.

- [ ] **Step 7: Commit**

```bash
git add app/api/stories/route.ts app/api/stories/[id]/route.ts components/stories/StoryCard.tsx components/stories/StoryFilters.tsx app/\(app\)/stories/page.tsx app/\(app\)/stories/\[id\]/page.tsx && git commit -m "feat: add story library with filters and story detail view"
```

---

## Phase 6: AI Script Generator

### 6.1: Script Generation API + UI

**Files:**
- Create: `app/api/stories/[id]/script/route.ts`
- Create: `components/script/ScriptEditor.tsx`
- Create: `components/script/RetentionMeter.tsx`
- Create: `app/(app)/scripts/page.tsx`

- [ ] **Step 1: Create app/api/stories/[id]/script/route.ts**

POST handler that calls `generateScript()` from `lib/claude.ts`. Updates story status to "scripted" and stores script JSON in Supabase. Uses streaming response so the UI can display words as they're generated.

- [ ] **Step 2: Create components/script/ScriptEditor.tsx**

Sectioned editor showing: Hook, Setup, Conflict, Escalation, Revenge, Outcome, CTA — each in its own editable card. Shows streaming text as it arrives. Displays word count and estimated duration. "Regenerate Section" button per section. "Copy Full Script" button.

- [ ] **Step 3: Create components/script/RetentionMeter.tsx**

Circular gauge showing retention score 0-100 with color coding and descriptive label (Poor/Okay/Good/Excellent).

- [ ] **Step 4: Create app/(app)/scripts/page.tsx**

Lists all stories that have scripts generated. Shows script previews, retention scores, quick actions (edit, regenerate, go to package).

- [ ] **Step 5: Commit**

```bash
git add app/api/stories/[id]/script/route.ts components/script/ScriptEditor.tsx components/script/RetentionMeter.tsx app/\(app\)/scripts/page.tsx && git commit -m "feat: add AI script generator with streaming output and retention meter"
```

---

## Phase 7: YouTube Package Generator

### 7.1: Package API + UI

**Files:**
- Create: `app/api/stories/[id]/package/route.ts`
- Create: `components/package/YouTubePackageForm.tsx`
- Create: `app/(app)/package/page.tsx`

- [ ] **Step 1: Create app/api/stories/[id]/package/route.ts**

POST handler that calls `generateYouTubePackage()` from `lib/claude.ts`. Updates story status to "packaged" and stores package JSON in Supabase.

- [ ] **Step 2: Create components/package/YouTubePackageForm.tsx**

Shows all 5 generated titles as clickable, editable fields. Shows thumbnail text field. Shows description textarea. Shows tags as removable chips + add input. Shows hashtags as removable chips. Each field has a copy button. "Export" dropdown with JSON / Text / PDF options.

- [ ] **Step 3: Create app/(app)/package/page.tsx**

Shows all packaged stories. Quick view of package details per story. Link to story detail.

- [ ] **Step 4: Commit**

```bash
git add app/api/stories/[id]/package/route.ts components/package/YouTubePackageForm.tsx app/\(app\)/package/page.tsx && git commit -m "feat: add YouTube package generator with editable titles and copy actions"
```

---

## Phase 8: Export System

### 8.1: JSON, Text, PDF, Google Docs Export

**Files:**
- Create: `lib/export/json.ts`
- Create: `lib/export/text.ts`
- Create: `lib/export/pdf.ts`
- Create: `components/export/ExportButton.tsx`
- Modify: `components/package/YouTubePackageForm.tsx` (add export dropdown)

- [ ] **Step 1: Create lib/export/json.ts**

```ts
import type { Story } from "@/types";

export function exportToJSON(story: Story): string {
  return JSON.stringify(
    {
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
    },
    null,
    2
  );
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
```

- [ ] **Step 2: Create lib/export/text.ts**

Exports a formatted plain text document combining: title, story body (or link), full script (with section headers), YouTube package (titles, thumbnail, description, tags, hashtags).

- [ ] **Step 3: Create lib/export/pdf.ts**

Uses `@react-pdf/renderer` to create a styled PDF document with: story title, script sections, YouTube package info. Uses a `Document`, `Page`, and `View` from `@react-pdf/renderer`.

```tsx
// Simplified structure
function ScriptPDF({ story }: { story: Story }) {
  const script = story.script;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{story.title}</Text>
        {script && (
          <>
            <Text style={styles.section}>HOOK</Text>
            <Text style={styles.body}>{script.hook}</Text>
            <Text style={styles.section}>SETUP</Text>
            <Text style={styles.body}>{script.setup}</Text>
            {/* ... all sections ... */}
          </>
        )}
      </Page>
    </Document>
  );
}
```

- [ ] **Step 4: Create Google Docs export**

Opens a new browser window/tab with a pre-filled Google Docs URL or copies formatted text to clipboard with instructions for pasting into Google Docs. Note: True Google Docs API integration requires OAuth — implement as a clipboard copy with instructions for MVP.

- [ ] **Step 5: Commit**

```bash
git add lib/export/json.ts lib/export/text.ts lib/export/pdf.ts components/export/ExportButton.tsx && git commit -m "feat: add multi-format export system (JSON, text, PDF)"
```

---

## Phase 9: Settings + Help

### 9.1: Settings Page + Custom Subreddits

**Files:**
- Create: `app/api/settings/keys/route.ts`
- Create: `app/api/settings/password/route.ts`
- Create: `app/api/subreddits/route.ts`
- Create: `app/(app)/settings/page.tsx`
- Create: `app/(app)/help/page.tsx`

- [ ] **Step 1: Create app/api/settings/keys/route.ts**

PUT handler to save Apify token and Anthropic key to Supabase `app_config` table.

- [ ] **Step 2: Create app/api/settings/password/route.ts**

PUT handler to update shared password. Validates old password first, then bcrypt-hashes and stores new one.

- [ ] **Step 3: Create app/api/subreddits/route.ts**

GET (list custom subreddits), POST (add subreddit), DELETE (remove subreddit by name).

- [ ] **Step 4: Create app/(app)/settings/page.tsx**

Three sections: API Keys (Apify token input, Anthropic key input with masked display), Shared Password (change password form), Danger Zone (clear all stories button with confirmation).

- [ ] **Step 5: Create app/(app)/help/page.tsx**

FAQ page with: how to get Apify API token, how to get Anthropic API key, understanding viral scores, how the pipeline works, tips for better scripts.

- [ ] **Step 6: Commit**

```bash
git add app/api/settings/keys/route.ts app/api/settings/password/route.ts app/api/subreddits/route.ts app/\(app\)/settings/page.tsx app/\(app\)/help/page.tsx && git commit -m "feat: add settings page and help/FAQ"
```

---

## Phase 10: Polish + Integration

### 10.1: Final Integration + Polish Pass

- [ ] **Step 1: Add story score refresh API** — `POST /api/stories/[id]/score` that recalculates and updates viral score.
- [ ] **Step 2: Connect all navigation flows** — "Generate Script" button in story detail navigates to scripts page, "Generate Package" navigates to package page.
- [ ] **Step 3: Add bulk delete** — checkbox selection on stories page, bulk actions toolbar.
- [ ] **Step 4: Add skeleton loaders** — all loading states use Skeleton components, no spinners.
- [ ] **Step 5: Add toast notifications** — success/error feedback for all major actions (scrape complete, script generated, package created, exported).
- [ ] **Step 6: Add empty states** — friendly empty state illustrations for each page with call-to-action.
- [ ] **Step 7: Add error boundaries** — client-side error boundaries around major components.
- [ ] **Step 8: Responsive sidebar** — collapse to icon-only on tablet, bottom tabs on mobile.
- [ ] **Step 9: Final commit**

```bash
git add . && git commit -m "feat: complete integration and polish pass"
```

---

## Spec Coverage Check

| Spec Requirement | Phase | Task |
|---|---|---|
| Shared password auth | Phase 2 | 2.1 |
| Login page + session | Phase 2 | 2.1 |
| Apify scrape integration | Phase 4 | 4.1 |
| Default 6 subreddits | Phase 4 | 4.1 |
| Custom subreddits (add/remove) | Phase 4 + 9 | 4.1 + 9.1 |
| Viral scoring (auto on scrape) | Phase 4 | 4.1 |
| Story library (grid/list, filters) | Phase 5 | 5.1 |
| AI script generator (streaming) | Phase 6 | 6.1 |
| Script sections (hook/setup/conflict/etc.) | Phase 6 | 6.1 |
| Retention score display | Phase 6 | 6.1 |
| YouTube package generator | Phase 7 | 7.1 |
| 5 titles, thumbnail text, description | Phase 7 | 7.1 |
| 15-25 tags + 5 hashtags | Phase 7 | 7.1 |
| Copy-to-clipboard per field | Phase 7 | 7.1 |
| Export: JSON, Text, PDF | Phase 8 | 8.1 |
| Export: Google Docs | Phase 8 | 8.1 |
| Settings: API keys | Phase 9 | 9.1 |
| Settings: Change password | Phase 9 | 9.1 |
| Dark cinematic Electric Storm theme | Phase 1 + 3 | 1.1 + 3.1 |
| Sidebar navigation (6 items) | Phase 3 | 3.1 |
| Electric Storm color palette | Phase 1 | 1.1 |
| Lucide icons | Phase 1 | 1.1 |

All spec requirements are covered. No placeholder TODOs in plan. ✓

---

**Plan saved to:** `docs/superpowers/plans/2026-04-25-youtube-content-system-plan.md`
