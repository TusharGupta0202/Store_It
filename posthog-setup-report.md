<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the **Store It** Next.js App Router project (Next.js 16.1.6). The following changes were made:

- **`instrumentation-client.ts`** (new): Client-side PostHog initialization using the Next.js 15.3+ instrumentation pattern. Initializes PostHog with a reverse proxy host (`/ingest`), error tracking (`capture_exceptions: true`), and debug mode in development. This is the recommended approach for Next.js 15.3+ apps — no PostHogProvider component needed.
- **`lib/posthog-server.ts`** (new): Server-side PostHog singleton client using `posthog-node`. Provides `getPostHogClient()` and `shutdownPostHog()` helpers for use in API routes and Server Actions.
- **`next.config.ts`** (updated): Added PostHog reverse proxy rewrites (`/ingest/*` → `https://us.i.posthog.com/*`) and `skipTrailingSlashRedirect: true`. This routes analytics traffic through your own domain to improve ad-blocker resilience.
- **`app/page.tsx`** (updated): Converted to a client component (`"use client"`) and added `posthog.capture()` calls on all four interactive CTAs — Deploy Now, Documentation, Templates, and Learning Center links.
- **`.env.local`** (updated): Ensured `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` are correctly set. Keys are read via environment variables in all code — never hardcoded.

## Events instrumented

| Event Name | Description | File |
|---|---|---|
| `cta_clicked_deploy` | User clicks the "Deploy Now" CTA button on the home page | `app/page.tsx` |
| `cta_clicked_documentation` | User clicks the "Documentation" link on the home page | `app/page.tsx` |
| `cta_clicked_templates` | User clicks the "Templates" link in the page description | `app/page.tsx` |
| `cta_clicked_learning_center` | User clicks the "Learning center" link in the page description | `app/page.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- 📊 **Dashboard — Analytics basics**: [https://us.posthog.com/project/323522/dashboard/1307635](https://us.posthog.com/project/323522/dashboard/1307635)

### Insights on the dashboard

- 📈 **CTA Clicks Over Time** (line chart, daily): [https://us.posthog.com/project/323522/insights/ZJCqidam](https://us.posthog.com/project/323522/insights/ZJCqidam)
- 🥧 **CTA Click Distribution (Pie)**: [https://us.posthog.com/project/323522/insights/VOIwUiLH](https://us.posthog.com/project/323522/insights/VOIwUiLH)
- 🔀 **Deploy CTA Conversion Funnel** (pageview → deploy click): [https://us.posthog.com/project/323522/insights/hYlhTq07](https://us.posthog.com/project/323522/insights/hYlhTq07)
- 👤 **Unique Users Clicking CTAs** (DAU bar chart): [https://us.posthog.com/project/323522/insights/UUqhQP1O](https://us.posthog.com/project/323522/insights/UUqhQP1O)
- 📊 **Documentation vs Deploy Interest** (weekly bar, by value): [https://us.posthog.com/project/323522/insights/HePcugn4](https://us.posthog.com/project/323522/insights/HePcugn4)

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/posthog-integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
