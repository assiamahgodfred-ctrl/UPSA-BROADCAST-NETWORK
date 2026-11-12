# CampusHub — Deployment Hardening Baseline

Production deployment checklist for the University Broadcast Network.

---

## 1. Environment Variable Isolation

| Variable | Required | Exposure Level | Storage Location |
|----------|----------|----------------|------------------|
| `VITE_SUPABASE_URL` | Yes | Public (client-side) | Vercel Environment Variables |
| `VITE_SUPABASE_ANON_KEY` | Yes | Public (client-side) | Vercel Environment Variables |
| `VITE_VAPID_PUBLIC_KEY` | No | Public (client-side) | Vercel Environment Variables |
| `SUPABASE_SERVICE_ROLE_KEY` | No | **SECRET** — server-side only | Supabase Dashboard (Edge Functions) |

### Rules

- [ ] **Never commit `.env.local` or `.env.production` to git** — `.gitignore` already excludes `*.local` and `.env.*`
- [ ] Add all secrets via Vercel Dashboard → Settings → Environment Variables
- [ ] Select Production, Preview, and Development for each variable
- [ ] Use `.env.example` as a template for required variables (no real values)
- [ ] Rotate `VITE_SUPABASE_ANON_KEY` if accidentally exposed

---

## 2. Session Timeout & Token Expiration

| Setting | Value | Location |
|---------|-------|----------|
| Access token lifetime | 1 hour | Supabase Dashboard → Auth → Settings |
| Refresh token lifetime | 6 months | Supabase Dashboard → Auth → Settings |
| Session persistence | Enabled | `src/lib/session.js` (`configureAuthSession`) |
| Auto-refresh token | Enabled | `src/lib/session.js` (`configureAuthSession`) |
| Auto sign-out on expiry | Enabled | `onSessionChange()` listener in `useEffect` |

### Session Security Rules

- [ ] `persistSession: true` — tokens survive page refresh securely
- [ ] `autoRefreshToken: true` — access tokens rotate in background
- [ ] `detectSessionInUrl: true` — handles OAuth callback redirects
- [ ] On `SIGNED_OUT` or `USER_DELETED` events → redirect to login
- [ ] No raw tokens exposed in `localStorage` — Supabase manages storage internally

---

## 3. Security Headers (vercel.json)

All headers enforced on every route (`/(.*)`):

- [ ] `X-Frame-Options: DENY` — clickjacking protection
- [ ] `X-Content-Type-Options: nosniff` — MIME-sniffing protection
- [ ] `X-XSS-Protection: 1; mode=block` — reflected XSS filter
- [ ] `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` — HSTS
- [ ] `Referrer-Policy: strict-origin-when-cross-origin` — referrer leakage protection

---

## 4. Database RLS Verification

Before production deployment, confirm in Supabase SQL Editor:

- [ ] `ALTER TABLE public.students ENABLE ROW LEVEL SECURITY`
- [ ] `ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY`
- [ ] No policies grant access to the `anon` role (unauthenticated = zero access)
- [ ] Student RLS: `auth.uid() = auth_id` for select/update own profile
- [ ] Admin RLS: `role = 'admin'` check for insert/update/delete on all tables
- [ ] Announcements RLS: authenticated users can read all; only admins can write
- [ ] `handle_new_user()` trigger auto-creates student profile on signup
- [ ] `updated_at` triggers maintain timestamp integrity

---

## 5. Push Notification (VAPID) Setup

- [ ] Generate VAPID key pair: `web-push generate-vapid-keys`
- [ ] Set `VITE_VAPID_PUBLIC_KEY` in Vercel Environment Variables
- [ ] Register service worker (`/sw.js`) on app load
- [ ] Test push subscription flow: subscribe → store in Supabase → receive notification
- [ ] Verify emergency alerts use `requireInteraction: true` in service worker

---

## 6. Offline Caching Verification

- [ ] IndexedDB cache (`campushub-cache`) stores announcements
- [ ] `localStorage` fallback for browsers without IndexedDB
- [ ] Stale-while-revalidate pattern: cache served immediately, background refresh
- [ ] Connection status indicator shows online/offline state
- [ ] Cached data accessible when network is disconnected

---

## 7. Pre-Deployment Checklist

- [ ] Run `supabase/schema.sql` in Supabase SQL Editor
- [ ] Create at least one admin user in `students` table (`role = 'admin'`)
- [ ] Configure email/password authentication in Supabase Auth
- [ ] Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel
- [ ] Set `VITE_VAPID_PUBLIC_KEY` in Vercel (optional, for push)
- [ ] Run `npm run build` successfully
- [ ] Deploy to Vercel via GitHub integration
- [ ] Verify HTTPS is active on production domain
- [ ] Test login/signup flow end-to-end
- [ ] Test admin announcement creation
- [ ] Test offline mode (disconnect network, refresh page)
- [ ] Verify security headers via browser DevTools → Network → Response Headers
