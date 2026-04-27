# YouTube Content System

A Next.js 15 web app for a faceless YouTube channel that scrapes Reddit revenge stories, generates YouTube scripts with Claude AI, and produces full YouTube packages.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.local.example .env.local
   ```
   Then fill in your credentials:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
   - `ANTHROPIC_API_KEY` - Anthropic API key for Claude
   - `APIFY_API_TOKEN` - Apify API token for Reddit scraping
   - `APP_PASSWORD_HASH` - BCrypt hash of your app password

3. **Set up Supabase:**
   Run the migration file to create the database schema:
   ```bash
   supabase db push
   ```
   or manually execute the SQL in `supabase/migrations/001_initial_schema.sql`

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   Navigate to http://localhost:3000

## Features

- Reddit story scraping via Apify
- AI-powered script generation with Claude
- Complete YouTube package creation (titles, thumbnails, descriptions, tags)
- Story management with status tracking
- Viral score calculation

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase
- Anthropic Claude AI
- Apify