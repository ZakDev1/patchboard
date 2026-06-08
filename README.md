<p align="center">
  <img src="public/logo-light.svg" alt="Patchboard" width="200" />
</p>

<p align="center">
  <a href="https://github.com/ZakDev1/patchboard/actions/workflows/ci.yaml">
    <img src="https://github.com/ZakDev1/patchboard/actions/workflows/ci.yaml/badge.svg" alt="CI" />
  </a>
  <a href="https://patchboard.vercel.app">
    <img src="https://img.shields.io/badge/live-patchboard.vercel.app-black" alt="Live" />
  </a>
  <a href="https://github.com/ZakDev1/patchboard/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" />
  </a>
</p>

<h3 align="center">Dependency updates, reviewed not ignored.</h3>

<p align="center">
  Patchboard scans your GitHub repos, shows you what's outdated, and lets you approve updates and raise a single PR - all without leaving the browser.
</p>

<p align="center">
  <a href="https://patchboard.vercel.app">Live App</a> · <a href="https://patchboard.vercel.app/docs">Documentation</a>
</p>

<br />

![Patchboard dashboard](public/screenshot.png)

---

## The problem

Most dependency updates get ignored. Not because developers don't care, but because the workflow is painful. Nine separate Dependabot PRs for nine packages, each needing a review, a merge, a CI run. It's easier to snooze the notification and move on.

Patchboard batches the whole process. Scan your repos, approve what you want, raise one PR with everything in it.

## Features

- **Instant scanning** - connect any GitHub repo and Patchboard compares your dependencies against the npm registry in seconds
- **Review workflow** - approve or snooze each update individually; major version bumps are flagged so nothing slips through unnoticed
- **Snapshot history** - every scan is saved so you can track how your dependency health changes over time
- **One-click PRs** - approve your updates and raise a single pull request with all changes in one go
- **Changelog links** - direct links to GitHub releases for every outdated package
- **Weekly digests** - automated email summaries every Monday with your latest dependency status
- **Free and Pro plans** - up to 3 repos free, unlimited on Pro

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions) |
| Database | Supabase (PostgreSQL) |
| ORM | Drizzle ORM |
| Auth | Supabase Auth with GitHub OAuth |
| Background jobs | Trigger.dev (weekly scheduled scans) |
| Email | Resend (weekly digest, critical alerts) |
| Billing | Stripe (test mode, webhooks) |
| Error tracking | Sentry |
| Analytics | PostHog |
| UI | Tailwind CSS, shadcn/ui |
| Testing | Vitest, Playwright, GitHub Actions CI |
| Deployment | Vercel |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Next.js App                      │
│                                                     │
│  ┌──────────────┐        ┌──────────────────────┐   │
│  │ Server       │        │ API Routes           │   │
│  │ Actions      │        │ /api/webhooks/stripe │   │
│  └──────┬───────┘        └──────────┬───────────┘   │
│         │                           │               │
└─────────┼───────────────────────────┼───────────────┘
          │                           │
    ┌─────▼─────┐               ┌─────▼─────┐
    │  Drizzle  │               │  Stripe   │
    │    ORM    │               │ Webhooks  │
    └─────┬─────┘               └───────────┘
          │
    ┌─────▼──────────┐
    │   Supabase     │
    │   PostgreSQL   │
    └────────────────┘

┌─────────────────────────────────────────────────────┐
│                 Trigger.dev                         │
│                                                     │
│  weekly-dependency-scan (cron: 0 9 * * 1)           │
│  ├── Fetch all projects from DB                     │
│  ├── For each project:                              │
│  │   ├── Decrypt GitHub token                       │
│  │   ├── Fetch package.json from GitHub             │
│  │   ├── Compare against npm registry               │
│  │   └── Save snapshot + package reviews            │
│  └── Send Resend email digest per user              │
└─────────────────────────────────────────────────────┘
```

## Local setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A GitHub OAuth app
- A [Stripe](https://stripe.com) account (test mode)
- A [Resend](https://resend.com) account
- A [Trigger.dev](https://trigger.dev) account

### 1. Clone and install

```bash
git clone https://github.com/ZakDev1/patchboard.git
cd patchboard
npm install
```

### 2. Environment variables

Create a `.env.local` file - see `.env.example` for all required values:

```bash
# Supabase
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# GitHub OAuth (via Supabase)
# Configure at: supabase.com → Authentication → Providers → GitHub

NEXT_PUBLIC_SITE_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=

# Resend
RESEND_API_KEY=

# Sentry (Optional, Sentry will create its own .env.sentry-build-plugin)
SENTRY_AUTH_TOKEN=

# PostHog
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=
NEXT_PUBLIC_POSTHOG_HOST=

# Token encryption (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
TOKEN_ENCRYPTION_KEY=
```

### 3. Set up the database

Run the schema in your Supabase SQL editor - see the full schema in [`db/schema.ts`](db/schema.ts).

Enable Row Level Security on all tables as documented in the [setup guide](https://patchboard.vercel.app/docs/getting-started).

### 4. Run the app

```bash
npm run dev
```

### 5. Run Trigger.dev locally

```bash
npx trigger.dev@latest dev
```

### 6. Forward Stripe webhooks locally

```bash
npx stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Open [http://localhost:3000](http://localhost:3000).

## Running tests

### Unit tests
```bash
npm run test:run
```

### E2E tests
```bash
npm run test:e2e
```

Unit cover the core scanning logic - version comparison, major bump detection, dependency merging, and error resilience. CI runs on every push via GitHub Actions with a live Postgres service container.
E2E tests cover the landing page, auth redirects and docs site. Unit tests cover the core scanning logic - version comparison, major bump detection, dependency merging and error resilience. Both suites run on every push via GitHub Actions.

## Deployment

Deploy to Vercel:

```bash
npx vercel
```

Add all environment variables in Vercel → Settings → Environment Variables.

For Stripe webhooks in production, set the endpoint to:
```
https://your-domain.vercel.app/api/webhooks/stripe
```

## Contributing

Contributions are welcome. Open an issue first to discuss what you'd like to change, then submit a pull request.

## License

MIT
