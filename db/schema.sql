create table users (
  id uuid primary key default gen_random_uuid(),
  github_id text unique not null,
  github_username text not null,
  email text,
  avatar_url text,
  created_at timestamptz default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  repo_owner text not null,
  repo_name text not null,
  created_at timestamptz default now(),
  unique(user_id, repo_owner, repo_name)
);

create table snapshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  captured_at timestamptz default now()
);

create table package_reviews (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid references snapshots(id) on delete cascade,
  package_name text not null,
  current_version text not null,
  latest_version text not null,
  is_major boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'snoozed')),
  notes text,
  repo_url text,
  reviewed_at timestamptz
);

create table package_metadata (
  package_name text not null,
  version text not null,
  changelog_url text,
  release_notes text,
  fetched_at timestamptz default now(),
  primary key (package_name, version)
);
