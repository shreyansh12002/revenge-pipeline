# YouTube Content System — Design Document

**Date:** 2026-04-25
**Project:** Reddit Revenge Story → YouTube Content Pipeline
**Status:** Draft

---

## 1. Concept & Vision

A shared-password web app that transforms Reddit revenge stories into fully packaged YouTube content. Users scrape high-retention stories from Reddit via Apify, filter them through a viral-readiness scoring system, generate cinematic YouTube scripts using Claude AI, and export complete YouTube packages (titles, thumbnails, tags, descriptions) — all in one linear pipeline. The app feels like a creator's war room: dark, focused, powerful.

---

## 2. Design Language

### Aesthetic Direction
**Electric Storm** — Deep navy-black backgrounds (#0a0f14), electric blue accents (#4a9eff), cool gray text. Cinematic, mysterious, modern. Feels like a mission control dashboard for content warfare.

### Color Palette
| Role | Hex | Usage |
|------|-----|-------|
| Background | `#0a0f14` | Page background |
| Surface | `#111a24` | Cards, panels |
| Surface Elevated | `#1a2636` | Hover states, modals |
| Border | `#1a2a3a` | Dividers, outlines |
| Primary Accent | `#4a9eff` | CTAs, active states, links |
| Secondary Accent | `#2dd4bf` | Success, positive actions |
| Danger | `#f43f5e` | Delete, errors |
| Warning | `#f59e0b` | Alerts, caution states |
| Text Primary | `#e2e8f0` | Headings, main text |
| Text Secondary | `#94a3b8` | Subtitles, descriptions |
| Text Muted | `#475569` | Placeholders, disabled |

### Typography
- **Headings:** Inter (700 weight) — clean, modern, readable
- **Body:** Inter (400/500 weight)
- **Monospace:** JetBrains Mono — for code/API keys
- **Scale:** 12 / 14 / 16 / 20 / 24 / 32 / 48px

### Spatial System
- Base unit: 4px
- Card padding: 20px / 24px
- Section gaps: 24px / 32px
- Sidebar width: 240px (collapsible to 64px)

### Motion Philosophy
- Subtle fade-ins on route changes (150ms ease-out)
- Skeleton loaders during scraping/AI generation
- Progress bars with shimmer effect
- Toast notifications slide in from top-right
- No jarring animations — everything feels deliberate

### Visual Assets
- Lucide React icons throughout
- Subtle gradient overlays on cards
- Glassmorphism on modals (backdrop-blur)
- Glowing blue focus rings on inputs

---

## 3. Layout & Structure

### App Shell
```
┌─────────────────────────────────────────────────┐
│  Sidebar (240px)  │  Main Content Area          │
│  ┌─────────────┐  │  ┌───────────────────────┐  │
│  │ Logo        │  │  │ Page Header + Actions│  │
│  ├─────────────┤  │  ├───────────────────────┤  │
│  │ Stories     │  │  │                       │  │
│  │ Scrape      │  │  │  Page Content         │  │
│  │ Scripts     │  │  │                       │  │
│  │ YT Package  │  │  │                       │  │
│  ├─────────────┤  │  │                       │  │
│  │ Settings    │  │  │                       │  │
│  │ Help        │  │  └───────────────────────┘  │
│  └─────────────┘  │                             │
└─────────────────────────────────────────────────┘
```

### Pages
1. **Login** — Shared password entry, full-screen centered
2. **Stories** — Story library with filters (subreddit, upvotes, recency, viral score)
3. **Scrape** — Configure Apify scrape, select subreddits, set filters, run scrape
4. **Story Detail** — View raw story, score it, start script generation
5. **Script** — Generated script with editable sections, preview mode
6. **YouTube Package** — Titles, thumbnail text, description, tags, hashtags
7. **Settings** — API keys (Apify, Anthropic), shared password, default filters
8. **Help** — Quick guide, FAQ

### Responsive Strategy
- Desktop-first (primary use case)
- Tablet: Sidebar collapses to icons
- Mobile: Sidebar becomes bottom tab bar

---

## 4. Features & Interactions

### 4.1 Authentication
- Single shared password stored in Supabase (hashed)
- Password entered on `/login` page
- Session persisted via Supabase auth cookies
- Auto-redirect to `/login` if no valid session
- Settings page allows changing the shared password (admin only)

### 4.2 Story Scraper (Apify Integration)
- Uses **apify/reddit-scraper** actor ($3.40/1000 results, $5 free credits/month)
- **Inputs:** Subreddit list, sort (Hot/New/Top), time range, min upvotes, min comments
- **Default subreddits:** ProRevenge, NuclearRevenge, MaliciousCompliance, EntitledPeople, AmITheAsshole, TrueOffMyChest
- **Custom subreddits:** User can add/remove subreddits in the scrape form
- **Outputs:** Post title, post body, author, subreddit, upvotes, comment count, URL, timestamp
- **States:** Idle → Running (with live progress) → Completed → Error
- **Error handling:** Show Apify error messages, retry button, budget warning

### 4.3 Viral Story Scoring
Each scraped story gets an automatic score (0-100) based on:
- Upvote count (weight: 30%)
- Comment count (weight: 25%)
- Story length (medium-long preferred, weight: 15%)
- Keyword triggers: revenge, karma, fired, boss, cheating, entitled, family, lawsuit, police (weight: 20%)
- Title emotional intensity (weight: 10%)

Stories below 40/100 flagged as "Low Retention Risk" — user can still proceed.

### 4.4 AI Script Generator (Claude)
- Uses Anthropic Claude API ( Sonnet 4.6 model)
- System prompt includes full channel strategy from CLAUDE.md
- **Inputs:** Story text, target duration (5-10 min), tone preferences
- **Outputs:** Full YouTube script following the 5-10 min structure:
  - Hook (0:00-0:07)
  - Setup (0:07-0:40)
  - Conflict (0:40-2:00)
  - Escalation (2:00-4:30)
  - Revenge (4:30-7:30)
  - Outcome (7:30-9:00)
  - CTA (9:00-10:00)
- **Features:**
  - Streaming output (words appear as generated)
  - Regenerate specific sections
  - Edit any section inline
  - Word count + estimated read time display
  - "Retention score" estimate shown after generation

### 4.5 YouTube Package Generator
- **Titles (5):** AI-generated, under 60 chars, curiosity gap, emotional words
- **Thumbnail Text (1):** Max 6 words, punchy
- **Description:** Hook paragraph + summary + CTA + SEO keywords
- **Tags (15-25):** reddit stories, revenge stories, karma stories, pro revenge, storytime, workplace revenge + custom
- **Hashtags (5):** #redditstories #revenge #karma #storytime #viralstories
- All fields editable inline
- Copy-to-clipboard for each field
- Export all as structured JSON or plain text

### 4.6 Story Library
- Grid/list view toggle
- Sort by: date scraped, upvotes, viral score, retention risk
- Filter by: subreddit, scraped/unscripted/packaged status
- Search by title keyword
- Bulk select for batch operations
- Delete individual or bulk

### 4.7 Settings
- **Apify API Token:** Stored encrypted in Supabase
- **Anthropic API Key:** Stored encrypted in Supabase
- **Shared Password:** Changeable
- **Default Scrape Filters:** Save preferred upvote threshold, time range
- **Subreddit Manager:** Add/remove custom subreddits (persisted per user session)
- **Danger Zone:** Clear all stories, reset settings

---

## 5. Component Inventory

### Shared Components
| Component | States | Notes |
|-----------|--------|-------|
| `Button` | default, hover, active, disabled, loading | Primary (blue), Secondary (ghost), Danger (red) |
| `Input` | default, focus, error, disabled | With optional label, helper text, error message |
| `Select` | default, open, selected, disabled | Custom styled dropdown |
| `Card` | default, hover, selected, loading | Story cards, script cards |
| `Badge` | info, success, warning, danger | Status indicators |
| `Modal` | open, closing | Backdrop blur, slide-in animation |
| `Toast` | success, error, info, warning | Auto-dismiss after 4s |
| `Skeleton` | shimmer animation | For loading states |
| `ProgressBar` | determinate, indeterminate | Scrape/AI progress |
| `Sidebar` | expanded, collapsed | Icon-only on collapse |
| `TagInput` | default, focused | For tags, hashtags |

### Page-Specific Components
- `ScrapeForm` — Subreddit multi-select, filter inputs, run button
- `ScrapeProgress` — Live Apify run status, items scraped count
- `StoryCard` — Thumbnail, title, score badge, status badge, actions
- `StoryDetail` — Full story text, viral score breakdown, action buttons
- `ScriptEditor` — Streaming text area with section markers, timer display
- `RetentionMeter` — Visual gauge showing estimated retention
- `YouTubePackageForm` — All editable output fields with copy buttons
- `LoginForm` — Password-only entry with error state

---

## 6. Technical Approach

### Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4 with custom design tokens
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (password-only, single shared credential)
- **AI:** Anthropic Claude API ( Sonnet 4.6)
- **Scraping:** Apify Reddit Scraper actor via Apify API
- **Icons:** Lucide React
- **Deployment:** Vercel (free tier)

### Data Model (Supabase PostgreSQL)

```sql
-- Shared password hash
CREATE TABLE app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL, -- password_hash, stored as bcrypt
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom subreddits per session/user
CREATE TABLE custom_subreddits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scraped stories
CREATE TABLE stories (
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
CREATE INDEX idx_stories_subreddit ON stories(subreddit);
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_viral_score ON stories(viral_score DESC);
CREATE INDEX idx_stories_scraped_at ON stories(scraped_at DESC);
```

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/login` | POST | Verify shared password, set session |
| `/api/auth/logout` | POST | Clear session |
| `/api/auth/check` | GET | Check if session is valid |
| `/api/settings/password` | PUT | Change shared password |
| `/api/settings/keys` | PUT | Save/update API keys |
| `/api/stories` | GET | List stories with filters |
| `/api/stories/[id]` | GET/DELETE | Get or delete single story |
| `/api/stories/[id]/score` | POST | Calculate/refresh viral score |
| `/api/stories/[id]/script` | POST | Generate script via Claude |
| `/api/stories/[id]/package` | POST | Generate YouTube package |
| `/api/scrape` | POST | Trigger Apify scrape job |
| `/api/scrape/[runId]` | GET | Poll Apify run status |
| `/api/subreddits` | GET/POST/DELETE | Manage custom subreddits |

### Apify Integration Details

**Actor:** `apify/reddit-scraper`
- Run via `POST https://api.apify.com/v2/acts/{actorId}/runs`
- Poll status via `GET https://api.apify.com/v2/acts/{actorId}/runs/{runId}`
- Fetch dataset via `GET https://api.apify.com/v2/datasets/{datasetId}/items`

**Input schema:**
```json
{
  "subreddits": ["ProRevenge", "NuclearRevenge"],
  "sort": "top",
  "timeRange": "month",
  "maxItems": 50,
  "minUpvotes": 3000,
  "minComments": 200
}
```

**Cost estimate:** ~$0.003-0.01 per scrape (50 posts), well within $5/month free credits.

### Claude Integration Details

**Model:** `claude-sonnet-4-20250514` ( Sonnet 4.6)
**Max tokens:** 4096 for script generation
**System prompt:** Loaded from `data/channel-strategy.md` (CLAUDE.md content)

### Security
- API keys encrypted at rest (Supabase vault or env-based)
- Shared password hashed with bcrypt
- Rate limiting on all API routes
- No sensitive data logged
- CORS restricted to app domain

---

## 7. Suggested Additional Features (Future Phases)

1. **Thumbnail Image Generator** — Use DALL-E or Flux API to generate actual thumbnail images based on story context
2. **Batch Export** — Export multiple scripts/packages as ZIP
3. **Scheduling Calendar** — Plan upload dates for exported videos
4. **A/B Title Tester** — Run two titles against CTR prediction
5. **Story Bookmarking** — Save stories from any device to process later
6. **Script Templates** — Different script structures for different story types
7. **Voice-Over Preview** — Text-to-speech preview of the script (ElevenLabs)
8. **Multi-language** — Translate scripts to Spanish, Portuguese for broader reach
9. **Analytics Dashboard** — Track which story types perform best
10. **Story Alerts** — Webhook-based alerts when a story hits viral thresholds

---

## 8. Open Questions

1. **Subreddit defaults:** Confirm the 6 default subreddits are correct? Any to add/remove?
2. **Script tone:** Should the AI lean more dramatic/intense, or conversational/friendly?
3. **Export formats:** Any preferred export format beyond JSON and plain text? (PDF, Google Docs, etc.)
4. **User limit:** How many concurrent users do you expect? (affects rate limiting)
5. **Data retention:** How long should stories be kept? (affects database sizing)
