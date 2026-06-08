<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into Patchboard. PostHog is now initialized client-side via `instrumentation-client.ts` (alongside the existing Sentry setup) and server-side via a shared `lib/posthog-server.ts` client using `posthog-node`. A reverse proxy was configured in `next.config.ts` to route PostHog requests through `/ingest` for improved reliability and ad-blocker resistance. Environment variables are set in `.env.local`. Thirteen events are captured across client and server, covering the full user lifecycle from sign-in through subscription.

| Event | Description | File |
|---|---|---|
| `user_signed_in` | User completes GitHub OAuth and is authenticated | `app/auth/callback/route.ts` |
| `project_created` | A new project record is inserted in the database | `app/actions/projects.ts` |
| `project_deleted` | User deletes a project | `app/actions/projects.ts` |
| `project_added` | User successfully connects a GitHub repo as a project | `components/add-project-form.tsx` |
| `project_add_failed` | User hit the free plan project limit | `components/add-project-form.tsx` |
| `project_synced` | User clicks Sync and a new dependency snapshot is created | `components/buttons/sync.tsx` |
| `package_approved` | User approves a package update for inclusion in a PR | `components/package-row.tsx` |
| `package_snoozed` | User snoozes a package update | `components/package-row.tsx` |
| `pr_opened` | User triggers a batch PR for approved dependency updates | `components/buttons/open-pr.tsx` |
| `upgrade_clicked` | User clicks Upgrade to Pro on the settings page | `components/buttons/upgrade-button.tsx` |
| `subscription_activated` | Stripe checkout completed — user upgraded to Pro | `app/api/webhooks/stripe/route.ts` |
| `subscription_cancelled` | User's Pro subscription was cancelled | `app/api/webhooks/stripe/route.ts` |

User identification (`posthog.identify`) is called server-side in `app/auth/callback/route.ts` when a user completes GitHub OAuth, linking their Supabase user ID with their email and GitHub username.

## Next steps

We've built a dashboard and five insights to keep an eye on user behavior based on the events just instrumented:

- [Analytics basics (wizard) — Dashboard](https://eu.posthog.com/project/196333/dashboard/732232)
- [New sign-ins over time](https://eu.posthog.com/project/196333/insights/k8pbEtbV)
- [Projects created over time](https://eu.posthog.com/project/196333/insights/kff96u09)
- [Package review activity (approved vs snoozed)](https://eu.posthog.com/project/196333/insights/3xvMy9vB)
- [PRs opened over time](https://eu.posthog.com/project/196333/insights/0k6LGlpT)
- [Onboarding funnel: sign-in → project → sync → PR](https://eu.posthog.com/project/196333/insights/0yzph2mi)

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
