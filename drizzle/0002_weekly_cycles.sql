create table if not exists weekly_cycles (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  week_start timestamptz not null,
  chooser_id uuid not null references profiles(id) on delete cascade,
  recommendation_id uuid references recommendations(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists weekly_cycles_group_week_unique on weekly_cycles(group_id, week_start);

drop index if exists recommendations_group_movie_unique;
