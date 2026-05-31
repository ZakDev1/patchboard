<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/ZakDev1/patchboard/main/public/logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/ZakDev1/patchboard/main/public/logo-light.svg">
    <img alt="Patchboard" src="https://raw.githubusercontent.com/ZakDev1/patchboard/main/public/logo-light.svg" width="340">
  </picture>
</p>

<p align="center">
  <img alt="CI" src="https://github.com/ZakDev1/patchboard/actions/workflows/ci.yaml/badge.svg">
</p>

# Patchboard

Track and review dependency updates across your GitHub repos. Scan your `package.json`, approve or snooze outdated packages, and raise a single pull request with all your changes - without even leaving the browser.

![Patchboard dashboard](public/screenshot.png)

## Features

- **Instant scanning** - connect any GitHub repo and Patchboard compares your dependencies against the npm registry in seconds
- **Review workflow** - approve or snooze each update individually; major version bumps are flagged so nothing slips through unnoticed
- **Snapshot history** - every scan is saved so you can track how your dependency health changes over time
- **One-click PRs** - approve your updates and raise a single pull request with all changes in one go
- **Changelog links** - direct links to GitHub releases for every outdated package

## Stack

- **Framework** - Next.js 15 (App Router, Server Actions)
- **Database** - Supabase (Postgres)
- **Auth** - Supabase Auth with GitHub OAuth
- **UI** - Tailwind CSS, shadcn/ui
- **npm data** - registry.npmjs.org (no API key required)
- **GitHub API** - REST API for repo access and PR creation

## How it works

1. Sign in with GitHub - Patchboard requests read access to your repos
2. Add a project by selecting a repo from your GitHub account
3. Hit **Sync** - Patchboard fetches your `package.json` and checks every dependency against the npm registry
4. Review the results - approve updates you want, snooze ones you don't
5. Hit **Open PR** - Patchboard creates a branch, updates `package.json` with all approved versions, and opens a pull request on your repo

## Local setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A GitHub OAuth app

### 1. Clone the repo

```bash
git clone https://github.com/ZakDev1/patchboard.git
cd patchboard
npm install
```

### 2. Set up Supabase

Create a new Supabase project and run the following in the SQL editor:

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  github_username text,
  avatar_url text,
  created_at timestamptz default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
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
  reviewed_at timestamptz,
  repo_url text,
  pr_url text
);

create table package_metadata (
  package_name text not null,
  version text not null,
  changelog_url text,
  release_notes text,
  fetched_at timestamptz default now(),
  primary key (package_name, version)
);

-- Auto create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, github_username, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'user_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 3. Enable Row Level Security

Run the following in the Supabase SQL editor to enable RLS on all tables:

```sql
-- profiles
alter table profiles enable row level security;

create policy "own profile only"
  on profiles for all
  using (id = auth.uid());

-- projects
alter table projects enable row level security;

create policy "own projects only"
  on projects for all
  using (user_id = auth.uid());

-- snapshots (scoped through projects)
alter table snapshots enable row level security;

create policy "own snapshots only"
  on snapshots for all
  using (
    exists (
      select 1 from projects
      where projects.id = snapshots.project_id
      and projects.user_id = auth.uid()
    )
  );

-- package_reviews (scoped through snapshots → projects)
alter table package_reviews enable row level security;

create policy "own package reviews only"
  on package_reviews for all
  using (
    exists (
      select 1 from snapshots
      join projects on projects.id = snapshots.project_id
      where snapshots.id = package_reviews.snapshot_id
      and projects.user_id = auth.uid()
    )
  );

-- package_metadata (shared cache, readable by all authenticated users)
alter table package_metadata enable row level security;

create policy "authenticated read"
  on package_metadata for select
  using (auth.role() = 'authenticated');
```

### 4. Set up GitHub OAuth

In Supabase → Authentication → Providers → GitHub, enable GitHub and paste in your OAuth credentials.

Create a GitHub OAuth app at [github.com/settings/developers](https://github.com/settings/developers):

```
Homepage URL: https://your-project.vercel.app
Authorization callback URL: https://your-project-url.supabase.co/auth/v1/callback
```

For local development, create a separate OAuth app (optional but recommended):

```
Homepage URL: http://localhost:3000
Authorization callback URL: https://your-project-url.supabase.co/auth/v1/callback
```

### 5. Environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:[password]@db.your-project-ref.supabase.co:5432/postgres?sslmode=require
```

### 6. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

Deploy to Vercel with one command:

```bash
npx vercel
```

Add the three environment variables in Vercel → Settings → Environment Variables.

## Contributing

Contributions are welcome. Open an issue first to discuss what you'd like to change, then submit a pull request.

## Credits

- Logo - AI generated
- Built with [Next.js](https://nextjs.org), [Supabase](https://supabase.com), [shadcn/ui](https://ui.shadcn.com), and the [npm registry](https://registry.npmjs.org)

## License

MIT
