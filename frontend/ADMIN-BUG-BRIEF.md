# SkinIQ Admin Bug — Complete Problem Brief

## The Error
On every admin page (`/en/admin`, `/en/admin/products`, etc.), user sees:
```
Admin Error
Error: An unexpected response was received from the server.
Stack: at I (https://skiniq-wellness.vercel.app/_next/static/chunks/01.lwjq37mflo.js:2:743)
```

The error is caught by `src/app/[locale]/(admin)/error.tsx`.

## What the error actually means
The error message `"An unexpected response was received from the server"` is thrown by Next.js 16's **`serverActionReducer`** (module 92114 in that chunk). The condition:

```js
// Simplified from the chunk
if (!isRSCResponse && !redirectLocation) {
  throw Error("An unexpected response was received from the server.")
}
```

This means: a **server action** was called from the client, and the server responded with a non-RSC payload (probably HTML error page) and no redirect header. Usually means the server action handler crashed during server-side rendering.

## Architecture

### Stack
- **Next.js 16.2.2** (very new, breaking changes from v15)
- **React 19.2.4**
- **@supabase/ssr ^0.10.0** (known incompatibility with Next.js 16)
- **@supabase/supabase-js ^2.102.1**
- **next-intl ^4.9.0** (i18n)
- **Tailwind CSS v4**
- **Deployed on Vercel** (auto-deploys from GitHub main branch)

### File Structure
- `src/app/layout.tsx` — Root layout (basic `<html>/<body>`)
- `src/app/[locale]/layout.tsx` — Locale layout (async server component, wraps ALL pages)
- `src/app/[locale]/(admin)/error.tsx` — Admin error boundary
- `src/app/[locale]/(admin)/admin/layout.tsx` — **Current fully client-side admin layout** (inline sidebar, `<a>` tags, no next-intl)
- `src/app/[locale]/(admin)/admin/page.tsx` — Dashboard page (client component, fetches from `/api/admin`)
- `src/app/[locale]/(admin)/admin/products/page.tsx` — Products page (client component)
- `src/app/[locale]/(admin)/admin/dashboard/actions.ts` — Dashboard server actions (NOT used by current page)
- `src/app/[locale]/(admin)/admin/products/actions.ts` — Product server actions
- Plus similar for: orders, users, promo-codes, traffic, reports, bundle-offers, hero

### Server Actions (the suspect)
Each admin section has a `actions.ts` file with `'use server'` functions. These use `createAdminClient()` from `@/utils/supabase/admin` (service_role key). But the server actions are imported by some admin components like `ProductForm.tsx`, `OrderManagement.tsx`, etc.

**Crucially**: the current dashboard page does NOT import any server actions — it uses `fetch('/api/admin')` instead. Yet the error still fires, which suggests the error might come from:
1. A different admin subpage being rendered during RSC navigation
2. The `(admin)/admin/loading.tsx` triggering something
3. The locale layout itself causing the issue

### Supabase Clients
- `src/utils/supabase/client.ts` — Uses `@supabase/supabase-js` directly (✅ NO SSR)
- `src/utils/supabase/server.ts` — Uses `@supabase/ssr` `createServerClient` with `cookies()` (❌ PROBLEMATIC)
- `src/utils/supabase/admin.ts` — Uses `@supabase/supabase-js` with service_role key (✅ NO COOKIES)
- `src/utils/supabase/middleware.ts` — Uses `@supabase/ssr` (runs at edge, probably OK)
- `src/utils/supabase/auth-check.ts` — Has dynamic import of `cookies()` (MIXED)

## What has been tried (ALL FAILED)

### Round 1 — Supabase SSR fixes
- Replaced all server-side `createClient()` calls in admin actions with `createAdminClient()` (service role, no cookies)
- Admin server actions still use `@supabase/supabase-js` directly

### Round 2 — Nested HTML fix
- Fixed `app/[locale]/layout.tsx` to not emit duplicate `<html>/<body>` tags
- Root layout keeps the single `<html>/<body>`, locale layout only has `<div>` wrapper

### Round 3 — Full client-side rendering
- Made admin layout `'use client'` with inline sidebar (no `AdminSidebar` import)
- Replaced ALL `<Link>` from `next-intl` with plain `<a>` tags (full page reloads)
- Removed `usePathname`, `useRouter`, `useTranslations` from admin layout
- Dashboard data fetched via `fetch('/api/admin')` (plain JSON, no RSC)

### Round 4 — Minimal shell
- Stripped admin to 10-line layout + 9-line static dashboard → **worked!**
- Restoring full components brought error back

## What still imports server.ts (uses @supabase/ssr cookies())
These are ONLY in the storefront, NOT in admin:
- `src/app/[locale]/(storefront)/account/actions.ts`
- `src/app/[locale]/(storefront)/page.tsx`
- `src/app/[locale]/(storefront)/products/[id]/page.tsx`
- `src/app/[locale]/(storefront)/products/page.tsx`
- `src/app/[locale]/(storefront)/checkout/actions.ts`

## The admin tech stack files

### Layout (current)
`src/app/[locale]/(admin)/admin/layout.tsx` — `'use client'`, full client-side, `<a>` tags

### Dashboard page
`src/app/[locale]/(admin)/admin/page.tsx` — `'use client'`, fetches `/api/admin`

### Error boundary
`src/app/[locale]/(admin)/error.tsx` — Catches the error

### API route
`src/app/api/admin/route.ts` — POST endpoint, returns JSON for all admin operations

## Key patterns to inspect

1. **`locale/layout.tsx`** — Async server component. Calls `getMessages()`, `setRequestLocale()` from next-intl. Imports `TrafficTracker.tsx` (client component that uses `usePathname` from `next/navigation`).

2. **`loading.tsx`** at `(admin)/admin/loading.tsx` — Server component loading state with skeleton UI.

3. **Admin server actions** — Even though not imported by dashboard, they exist in the codebase. Next.js might be bundling them eagerly.

4. **`app/layout.tsx`** — Root layout, normal, no issues.

## Debugging clues

1. Initial HTTP request to `/en/admin` via curl returns **200 OK with full HTML** ✅
2. The RSC streaming also completes successfully on initial load ✅
3. The API endpoint `/api/admin` returns **200 with valid JSON** ✅
4. The error ONLY appears on the client side after hydration ❌
5. The error is caught by the `(admin)/error.tsx` boundary

## Hypothesis
The error likely happens because:
1. **Some admin subpage** (products page likely) when navigated to via full page reload throws a server-side rendering error
2. The error page (HTML) is returned instead of RSC, triggering the `serverActionReducer` error
3. Or: the `loading.tsx` skeleton is trying to render something that fails

OR the root cause is:
- **Next.js 16 bug** with `@supabase/ssr` `cookies()` API
- The `@supabase/ssr ^0.10.0` package imports `cookies()` from `next/headers` which in Next.js 16 returns a Promise (breaking change). Even if the admin doesn't directly import it, the bundler might include it.

## Files to check for the fix
- `src/app/[locale]/layout.tsx` — wraps ALL pages including admin
- `src/app/[locale]/(admin)/admin/layout.tsx` — current admin layout
- `src/app/[locale]/(admin)/admin/page.tsx` — dashboard
- `src/app/[locale]/(admin)/admin/products/page.tsx` — products
- `src/components/admin/ProductForm.tsx` — imports server actions
- `src/components/admin/ProductTable.tsx` — imports server actions
- `src/components/admin/OrderManagement.tsx` — imports server actions
- `src/components/admin/AdminAuthClient.tsx` — auth check on every admin page
- `src/utils/supabase/client.ts` — browser client
- `src/utils/supabase/server.ts` — SSR client (uses `@supabase/ssr`)
- `src/utils/supabase/admin.ts` — service role client
- `package.json` — dependencies including `@supabase/ssr ^0.10.0`

## Desired outcome
Admin pages should load without any RSC errors. The simplest fix is preferred — even if it means removing all server actions from admin and relying entirely on the `/api/admin` REST endpoint for all CRUD operations.