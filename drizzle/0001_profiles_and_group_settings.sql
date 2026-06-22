alter table profiles add column if not exists username text;
create unique index if not exists profiles_username_unique on profiles(username);

alter table groups add column if not exists access_pin text;
alter table groups add column if not exists is_public boolean not null default false;

create table if not exists profile_favorite_movies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  movie_id uuid not null references movies(id) on delete cascade,
  position integer not null check (position >= 1 and position <= 5),
  created_at timestamptz not null default now()
);

create unique index if not exists profile_favorite_movies_user_movie_unique on profile_favorite_movies(user_id, movie_id);
create unique index if not exists profile_favorite_movies_user_position_unique on profile_favorite_movies(user_id, position);
