create table if not exists public.waitlist_signups (
  id bigserial primary key,
  email text not null unique,
  created_at timestamptz not null default now(),
  referrer text,
  user_agent text
);

create index if not exists waitlist_signups_created_at_idx
  on public.waitlist_signups (created_at desc);

create table if not exists public.mevo_analytics (
  id bigserial primary key,
  event_name text not null,
  user_id text,
  world_id uuid,
  episode_id uuid,
  value_num numeric,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists mevo_analytics_created_at_idx
  on public.mevo_analytics (created_at desc);
create index if not exists mevo_analytics_event_idx
  on public.mevo_analytics (event_name, created_at desc);
