create table if not exists user_profile (
  id text primary key default 'default',
  person_name text not null default 'Lara',
  city text not null default 'Stuttgart',
  latitude double precision not null default 48.7758,
  longitude double precision not null default 9.1829,
  timezone text not null default 'Europe/Berlin',
  morning_time text not null default '07:30',
  warmth_offset double precision not null default 0,
  wind_sensitive boolean not null default true,
  rain_sensitive boolean not null default true,
  prefers_skirt boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into user_profile (id)
values ('default')
on conflict (id) do nothing;

create table if not exists daily_recommendations (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null references user_profile(id),
  date date not null,
  city text not null,
  weather jsonb not null,
  recommendation jsonb not null,
  feedback text,
  feedback_at timestamptz,
  warmth_offset_before double precision not null,
  warmth_offset_after double precision,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique(profile_id, date)
);
