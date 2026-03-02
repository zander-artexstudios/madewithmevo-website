create table if not exists public.waitlist_signups (
  id bigserial primary key,
  email text not null unique,
  created_at timestamptz not null default now(),
  referrer text,
  user_agent text
);

create index if not exists waitlist_signups_created_at_idx
  on public.waitlist_signups (created_at desc);
