# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # Run ESLint
node scripts/generate-seo-assets.mjs  # Regenerate favicon/app icon/OG assets
```

No test suite is configured.

## What This App Is

**Scout** — a marketplace connecting small businesses with micro-influencer creators for paid and in-kind collaborations. Two distinct user types: **businesses** (post campaigns, review applicants, message matched creators) and **creators** (discover campaigns, apply, chat with businesses).

## Architecture

**Stack**: Next.js App Router · TypeScript · Supabase (Postgres + Auth + Storage + Realtime) · TailwindCSS · Radix UI · Resend (email)

### Supabase Client Pattern

Three separate clients — always use the right one:

- [src/utils/supabase/client.ts](src/utils/supabase/client.ts) — browser client (use in `"use client"` components)
- [src/utils/supabase/server.ts](src/utils/supabase/server.ts) — server client with cookie handling (use in Server Components, Route Handlers, Server Actions)
- [src/utils/supabase/service.ts](src/utils/supabase/service.ts) — service-role client (bypasses RLS; only for admin API routes)

### Auth Flow

Login → Google OAuth or Email OTP → `/auth/callback` → `upsertBusinessUser()` in [src/lib/user-auth.ts](src/lib/user-auth.ts) → if `hasProfile` redirect to `/dashboard`, else redirect to `/onboarding/business`.

User role is stored in the `users` table (`role: 'business' | 'creator'`). The audience/role toggle on the homepage uses a `scout_audience` cookie, handled in [src/lib/audience.ts](src/lib/audience.ts).

### Key Data Models

Defined in [src/types/models.ts](src/types/models.ts) and [src/types/jobs.ts](src/types/jobs.ts):

- `users` → `business_profiles` / `creator_profiles` (1:1)
- `campaigns` (owned by `business_profiles.id`)
- `matches` (campaign × creator; has `status`)
- `messages` (belong to a `match`)

Campaign creation is a 3-step wizard: [src/components/campaigns/steps/](src/components/campaigns/steps/) — Step 1 (basics), Step 2 (content requirements), Step 3 (compensation/deadline). Orchestrated by [src/components/campaigns/campaign-builder-form.tsx](src/components/campaigns/campaign-builder-form.tsx).

### Real-time

Supabase Realtime subscriptions are used for:
- In-app notifications ([src/components/notifications/](src/components/notifications/))
- Live chat in [src/components/matches/chat-view.tsx](src/components/matches/chat-view.tsx)

### API Routes

Located in [src/app/api/](src/app/api/):
- `send-welcome` / `validate-coupon` / `redeem-coupon` — business logic endpoints
- `users/delete` — cascading account deletion via service-role client
- `webhooks/supabase` — receives DB webhook events (e.g., triggers emails on new applications)

Email sending uses Resend; templates live in [src/lib/email.ts](src/lib/email.ts).

### SEO

Shared SEO constants and helpers live in [src/lib/seo.ts](src/lib/seo.ts). The root layout declares global metadata, app icons, manifest, OpenGraph/Twitter defaults, Apple web app metadata, and Organization/WebSite/WebApplication JSON-LD. Metadata routes are [src/app/robots.ts](src/app/robots.ts), [src/app/sitemap.ts](src/app/sitemap.ts), and [src/app/manifest.ts](src/app/manifest.ts).

Public metadata overrides exist on `/waitlist` and `/discover-campaigns`. Private/auth route groups use layout-level noindex metadata for admin, campaigns, creators, dashboard, login, matches, onboarding, and settings. Production canonical, sitemap, and robots URLs depend on `NEXT_PUBLIC_APP_URL` being set to the real domain.

### Path Alias

`@/*` resolves to `./src/*` (configured in [tsconfig.json](tsconfig.json)).

### UI Components

Radix UI primitives wrapped in [src/components/ui/](src/components/ui/) (Input, Label, Select, Textarea, etc.). Visual effects use Anime.js and Pixi.js — see [src/components/effects/](src/components/effects/) and [src/components/ui/confetti-burst.tsx](src/components/ui/confetti-burst.tsx).

Responsive layout: desktop shows [src/components/layout/business-sidebar.tsx](src/components/layout/business-sidebar.tsx); mobile shows [src/components/layout/mobile-header.tsx](src/components/layout/mobile-header.tsx).
