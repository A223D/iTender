## Commands
- `npm run dev` — Start Next.js dev server (port 3000 default)
- `npm run build` — Production build
- `npm run start` — Serve production build
- `npm run lint` — ESLint (next/core-web-vitals + next/typescript)
- No test suite configured

## App Identity
**Scout** — a marketplace connecting small businesses with micro-influencer creators. User role stored in `users.role` (`"business"` | `"creator"`); audience/role toggle on homepage uses `scout_audience` cookie (`src/lib/audience.ts`). The discover board (`/discover-campaigns`) has two overlapping domains: `brand_categories` in TypeScript types maps to the actual DB column `cuisine_type` on `business_profiles` (rename not yet migrated).

## Architecture & Stack
Next.js 15 App Router · TypeScript strict · Supabase (Postgres + Auth + Storage + Realtime) · TailwindCSS 3 · Radix UI · Resend (email) · Anime.js · Pixi.js

## Supabase Clients — Must Use the Correct One
| File | Where to Use | Notes |
|---|---|---|
| `src/utils/supabase/client.ts` | `"use client"` components | `createBrowserClient(url, key)` |
| `src/utils/supabase/server.ts` | Server Components, Route Handlers, Server Actions | `createClient(cookieStore)` — pass `await cookies()` |
| `src/utils/supabase/service.ts` | Admin routes, webhooks, deletion | Service-role key; bypasses RLS; NEVER use in user-facing code |

Auth check in middleware and server pages: use `supabase.auth.getUser()` (validates JWT server-side), NOT `getSession()`.

## Auth Flow (Exact Steps)
1. **Middleware** (`src/middleware.ts`) — protects `/dashboard`, `/campaigns`, `/onboarding/business`, `/matches`, `/creators`, `/settings`; redirects unauthenticated users to `/login`
2. **Login** (`src/app/login/page.tsx`) — Google OAuth (`signInWithOAuth` → redirect to `/auth/callback`) or Email OTP (`signInWithOtp` → `verifyOtp`)
3. **Callback** (`src/app/auth/callback/route.ts`) — `exchangeCodeForSession(code)` → `getUser()` → `upsertBusinessUser(supabase, user)` (`src/lib/user-auth.ts`) — upserts `users` row with `role="business"`, checks for `business_profiles` row → redirect to `/dashboard` or `/onboarding/business`
4. **Welcome email** — fire-and-forget (`.catch()` only, not awaited) so redirect is immediate
5. **Server page auth guard** — every server page: `getUser()` → if null `redirect("/login")`
6. **Sign out** — `supabase.auth.signOut()` → `router.push("/")` (`src/components/dashboard/sign-out-button.tsx`)

## Database Models
Defined in `src/types/models.ts`, `src/types/jobs.ts`:
- `users` (id, role, name, email, city, avatar_url) — city lives on `users`, not on profiles
- `business_profiles` (user_id UNIQUE FK→users, brand_name, industry, logo_url, website_url, brand_values, cuisine_type) — `cuisine_type` is mapped as `brand_categories` in discover page types (rename pending)
- `creator_profiles` (user_id UNIQUE FK→users, profile_photo_url, bio, brand_categories[], instagram_handle, instagram_followers, tiktok_handle, tiktok_followers, youtube_handle, youtube_followers, gallery_images[])
- `campaigns` (business_id FK→business_profiles, title, content_types[], description, status, compensation_type, compensation_details, creators_needed, deadline, interested_count, photo_urls[], reference_doc_url, reference_doc_name, coupon_code, occasion)
- `swipes` (campaign_id, creator_id FK→users, direction, pitch)
- `matches` (campaign_id, creator_id FK→users, business_id FK→users)
- `messages` (match_id, sender_id FK→users, content)
- `match_reads` (match_id + user_id composite PK, last_read_at)
- `coupons` (code UNIQUE, discount, max_uses, uses_count, expires_at)

## Key Patterns

### Campaign Creation (3-step wizard)
`src/components/campaigns/campaign-builder-form.tsx` orchestrates `src/components/campaigns/steps/step-{1,2,3}-fields.tsx`:
- Step 1: title + content types
- Step 2: description + image upload (5MB) + doc upload (15MB)
- Step 3: compensation + creators needed + deadline + coupon
- On submit: upload media → insert campaign → if coupon: `POST /api/redeem-coupon` → confetti → redirect to `/dashboard`

### Realtime Subscriptions
Pattern: `supabase.channel(name).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: "match_id=eq.${id}" }, callback).subscribe()`. Must `supabase.removeChannel(channel)` on cleanup.

- `src/components/matches/chat-view.tsx` — live messages with optimistic send (temp `"temp-{ts}"` id replaced on real row; rollback on error)
- `src/components/matches/matches-panel-shell.tsx` — match list realtime re-sort
- `src/components/notifications/notification-listener.tsx` — toasts on new swipes + messages; subscribes to both `swipes` and `messages` tables

### Supabase Joins — Shape Normalization Required
Supabase may return joined relations as either objects or single-element arrays. Always normalize. See `extractProfilePhoto()` in `src/types/models.ts` and normalization patterns in `CampaignDetailView`, `discover-campaigns/page.tsx`, and `matches/layout.tsx`.

### File Storage
Uploads scoped to `{userId}/` under buckets `profile-images` and `campaign-images`. Use `extractStoragePath(url, bucket)` from `src/lib/storage-utils.ts` to parse URLs for removal. Set `contentType` explicitly on doc uploads (see `DOC_MIME_TYPES` in `src/lib/campaign-constants.ts`).

### Account Deletion
3-phase via `src/lib/delete-user.ts` → `POST /api/users/delete`:
1. `service.rpc("delete_user_data", { p_user_id })` — SECURITY DEFINER SQL function (9-step cascade, idempotent with `IF array_length > 0` guards)
2. `service.auth.admin.deleteUser(userId)` — remove auth identity
3. Storage cleanup per bucket — best-effort, collects `storageWarnings[]`

Self-deletion calls `supabase.auth.signOut().catch(() => {})` after — the catch is intentional since the auth identity may already be gone.

### Admin (`/admin/users`)
Uses `"use server"` form actions + cookie-based auth (`ADMIN_SECRET` env var, 1hr cookie). User search via `service.from("users").select(...).ilike("email", query)`; deletion calls `executeUserDeletion()`.

### Audience/Cookie System
`src/lib/audience.ts` — `scout_audience` cookie, 1yr max-age, SameSite=Lax. `useAudienceSelection()` hook in `src/components/home/use-audience-selection.ts` sets cookie + `startTransition(() => router.refresh())`.

### Notifications Quirks
- `campaignIds.join(",")` in `useEffect` dependency for stable string comparison (not array reference)
- `pathnameRef` tracks current page so message toasts are suppressed when viewing `/matches`
- AudioContext keepalive: plays inaudible 1-sample buffer every 20s to prevent browser suspend

### Coupon System
- `POST /api/validate-coupon` — lookup code, check expiry/usage
- `POST /api/redeem-coupon` — `rpc("increment_coupon_uses")` (SECURITY DEFINER, atomic)
- 100% coupon → shows "Publish Campaign" directly (no payment step)
- `CouponState` type defined in `step-3-fields.tsx`

## Constants & Enums
- **Compensation types** (`src/lib/campaign-constants.ts`): paid, product, paid_product, affiliate, negotiable
- **Content types**: Post, Short-form Video, Long-form Video, Story, Blog / Article
- **Campaign statuses**: live, draft, closed, pending, completed — each with label + Tailwind style map
- **File size limits** (`src/lib/app-config.ts`): logo=5MB, image=5MB, doc=15MB
- **Unread badge max**: 9 (shows "9+")
- **Onboarding industries**: UGC, Food & Beverage, Fashion, Beauty, Tech, Health, Travel, Home, Sports, Entertainment, Other

## Page-Level Type Exports
Some types are defined in page files and imported by child components:
- `ChatMatch`, `ChatMessage` in `src/app/matches/[id]/page.tsx` → imported by `ChatView`
- `CampaignDetail`, `InterestedCreator`, `NormalizedCreator` in `src/app/campaigns/[id]/page.tsx` → imported by `CampaignDetailView`, `CreatorPipeline`, `CreatorCard`
- `CreatorProfile` in `src/app/creators/[id]/page.tsx` → imported by `CreatorProfileView`

## Conventions
- Path alias: `@/*` → `./src/*`
- UI primitives: `src/components/ui/` — Radix wrappers with custom styling
- Effects: `src/components/effects/` (ParticleCanvas), `src/components/ui/confetti-burst.tsx`
- `cn()` from `src/lib/utils.ts` — clsx + tailwind-merge for all conditional classes
- Responsive: `BusinessSidebar` (desktop), `MobileHeader` (mobile) — both receive same props
- Dark panels: repeated gradient `from [#07070E] via [#0F0F1A] to [#161628]` with ambient colored blobs (violet/coral/teal) at `blur-[80-140px]`
- Tailwind custom colors: ink, paper, clay, moss, blush (light theme) + void, depth, surface, card, coral, violet, teal, gold, light (dark theme)
- Fonts: `font-sans` (Avenir Next), `font-display` (Trebuchet MS)