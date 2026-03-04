# MEVO Waitlist (Next.js + Supabase)

Minimal one-page waitlist with Apple-style polish.

## Features

- Full-bleed hero background (`/public/hero.png`)
- Centered MEVO logo (`/public/logo.png`)
- Headline: **Your friends, your content**
- Single email field + **Join our waitlist** button
- API endpoint with:
  - email validation
  - dedupe (unique email)
  - basic rate limiting
- Supabase storage
- Admin page (`/admin`) protected by `ADMIN_PASSWORD`
- CSV export of signups

## 1) Setup

```bash
npm install
cp .env.example .env.local
```

Set env values in `.env.local`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`

## 2) Supabase table

In Supabase SQL editor, run:

```sql
-- from supabase.sql
create table if not exists public.waitlist_signups (
  id bigserial primary key,
  email text not null unique,
  created_at timestamptz not null default now(),
  referrer text,
  user_agent text
);

create index if not exists waitlist_signups_created_at_idx
  on public.waitlist_signups (created_at desc);
```

## 3) Add assets

Put these files in `/public`:

- `hero.png` (provided MEVO hero image)
- `logo.png` (bubble/cloud MEVO logo from the same image)

## 4) Run locally

```bash
npm run dev
```

Open: `http://localhost:3000`

## 5) Admin

- Go to `http://localhost:3000/admin`
- Enter `ADMIN_PASSWORD`
- View signups + click **Download CSV**

## 6) Deploy to Vercel

```bash
vercel
vercel --prod
```

In Vercel Project Settings → Environment Variables, add:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `MEVO_EPISODE_BASE_COST` (optional, default 100)

Redeploy after adding env vars.

## 7) Mevo backend scaffolding (new)

The app now includes starter APIs for Mevo world/credit/orchestration flows:

- `GET/POST /api/mevo/worlds`
- `GET /api/mevo/credits`
- `POST /api/mevo/episodes/queue`
- `POST /api/mevo/episodes/generate` (pipeline stub: memory -> script -> shotlist)
- `POST /api/mevo/episodes/run-due` (batch runner for queued episodes + retry logic)
- `POST /api/mevo/episodes/publish` (moves generated episode to published + share URL)
- `GET /api/mevo/admin/costs` (credit spend visibility, requires admin cookie)
- `/admin/mevo` (internal dashboard + run queued episodes/publish smoke test)

These endpoints use Supabase tables from your Mevo schema (`worlds`, `episodes`, `credit_ledgers`, `world_memory`).
They are designed as a clean MVP scaffold for the persistent world engine.

### Auth for Mevo APIs
Mevo APIs now require `Authorization: Bearer <supabase_access_token>`.
For local development only, you can set `MEVO_DEV_USER_ID` to bypass token auth.

### Scheduler security
`POST /api/mevo/episodes/run-due` now requires `x-mevo-scheduler-key`.
Set `MEVO_SCHEDULER_KEY` and pass the same value from your cron/scheduler.
