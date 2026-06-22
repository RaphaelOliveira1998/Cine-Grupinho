create table if not exists profiles (
  id uuid primary key,
  name text not null,
  username text unique,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  invite_code text not null unique,
  access_pin text,
  is_public boolean not null default false,
  owner_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now()
);

create unique index if not exists group_members_group_user_unique on group_members(group_id, user_id);

create table if not exists movies (
  id uuid primary key default gen_random_uuid(),
  tmdb_id integer not null unique,
  title text not null,
  original_title text,
  overview text,
  poster_path text,
  release_date text,
  genres jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists profile_favorite_movies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  movie_id uuid not null references movies(id) on delete cascade,
  position integer not null check (position >= 1 and position <= 5),
  created_at timestamptz not null default now()
);

create unique index if not exists profile_favorite_movies_user_movie_unique on profile_favorite_movies(user_id, movie_id);
create unique index if not exists profile_favorite_movies_user_position_unique on profile_favorite_movies(user_id, position);

create table if not exists recommendations (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  movie_id uuid not null references movies(id) on delete cascade,
  recommended_by uuid not null references profiles(id) on delete cascade,
  status text not null default 'recommended',
  created_at timestamptz not null default now()
);

create unique index if not exists recommendations_group_movie_unique on recommendations(group_id, movie_id);

create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null references recommendations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  stars integer not null check (stars >= 1 and stars <= 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists ratings_recommendation_user_unique on ratings(recommendation_id, user_id);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null references recommendations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
