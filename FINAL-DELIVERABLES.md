# CampusHub — Final Project Deliverables

Presentation defense structure and contribution statement for the University
Broadcast Network security-focused project.

---

## Table of Contents (Presentation Slides)

| Slide | Section | Content |
|-------|---------|---------|
| 1 | Title | Project name, course, presenter, date |
| 2 | Architecture & Threat Model | System architecture diagram, trust boundaries, threat model |
| 3 | System Build | Tech stack, file structure, build pipeline, Vercel deployment |
| 4 | Security Controls — RBAC & RLS | Database schema, role-based policies, IDOR mitigation |
| 5 | Security Controls — SQLi Defense | Parameterized queries, input validation, schema constraints |
| 6 | Security Controls — Transport Protection | TLS/HTTPS, HSTS, security headers, session management |
| 7 | Security Controls — Push & Offline | Service worker, push notifications, IndexedDB caching |
| 8 | Attack-Resistance Testing | SQLi test results, IDOR test results, concurrency approach |
| 9 | Accessibility (WCAG 2.1 AA) | Contrast ratios, ARIA labels, keyboard navigation |
| 10 | Deployment Hardening | Environment variables, session timeout, pre-deployment checklist |
| 11 | Live Demo | Login, dashboard, admin announcement creation, emergency alert |
| 12 | Contribution Statement | Individual work breakdown |
| 13 | Q&A | Open floor |

---

## Architecture & Threat Model

### System Architecture

```
┌─────────────┐     HTTPS/TLS 1.3     ┌──────────────────┐
│  React Vite │ ◄───────────────────► │   Vercel Edge    │
│  (Frontend) │                       │  (Security Headers)│
└─────────────┘                       └──────────────────┘
        │                                      │
        │ HTTPS/TLS 1.3                        │
        ▼                                      ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase Platform                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │ Auth (JWT)  │  │ Realtime    │  │ PostgreSQL  │   │
│  │ (session)   │  │ (push)      │  │ (RLS)       │   │
│  └─────────────┘  └─────────────┘  └─────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Threat Model

| Threat | Mitigation |
|--------|-----------|
| SQL Injection | Parameterized queries via PostgREST + schema CHECK constraints |
| IDOR (Unauthorized data access) | Row Level Security policies on every table |
| Cross-Site Scripting (XSS) | `X-XSS-Protection` header + React's built-in XSS protection |
| Clickjacking | `X-Frame-Options: DENY` |
| MIME Sniffing | `X-Content-Type-Options: nosniff` |
| Protocol Downgrade | HSTS with `max-age=63072000; includeSubDomains; preload` |
| Session Hijacking | HTTPS-only, auto-refresh tokens, no plaintext token storage |
| Unauthorized Push | VAPID-signed subscriptions tied to `auth.uid()` |
| Offline Data Exposure | IndexedDB cache scoped to same-origin, no sensitive data cached |

---

## System Build

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 + Vite | UI framework and build tool |
| Styling | Tailwind CSS | Utility-first CSS with dark mode |
| Icons | Lucide React | Consistent iconography |
| Backend/DB | Supabase (PostgreSQL) | Database, Auth, Realtime |
| Deployment | Vercel | Edge hosting with security headers |
| Offline Cache | IndexedDB + localStorage | Offline-first data persistence |
| Push | Service Worker + Push API | Background notification delivery |

### File Structure

```
isecGr10/
├── supabase/
│   └── schema.sql              # DB schema + RLS policies
├── public/
│   ├── sw.js                   # Service Worker (push + offline)
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── AdminRoute.jsx  # RBAC wrapper component
│   │   │   ├── UrgencyBadge.jsx # Priority color badging
│   │   │   └── ...
│   │   ├── EmergencyAlertBanner.jsx  # High-priority alert banner
│   │   └── AuthPortal.jsx      # Unified sign-in/sign-up
│   ├── lib/
│   │   ├── supabase.js         # Supabase client + session config
│   │   ├── session.js          # Session management (auto-refresh, sign-out)
│   │   ├── push.js             # Push notifications + offline cache
│   │   └── offlineCache.js     # IndexedDB/localStorage cache layer
│   ├── pages/
│   │   ├── Dashboard.jsx       # Main announcement dashboard
│   │   ├── AuthPage.jsx        # Login page
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.jsx     # Auth state provider
│   ├── main.jsx                # Entry point + SW registration
│   └── index.css               # Tailwind styles
├── vercel.json                 # Security headers configuration
├── SECURITY.md                 # Security controls documentation
├── DEPLOYMENT.md               # Deployment hardening checklist
├── ACCESSIBILITY.md            # WCAG 2.1 AA audit report
└── package.json
```

---

## Security Controls Detail

### RBAC (Role-Based Access Control)

Three permission tiers enforced entirely at the database layer:

| Role | Students Table | Announcements Table |
|------|---------------|---------------------|
| **Unauthenticated** | Zero access | Zero access |
| **Student** | Read/Write own profile only | Read all |
| **Admin** | Read/Write all | Read/Write all |

### SQL Injection Defense

- Parameterized query builder via Supabase/PostgREST
- Client-side regex validation (`/^\d{8}$/` for index numbers)
- Password complexity validation
- Database CHECK constraints on all enumerated fields

### Transport Protection

- TLS 1.3 on all connections
- HSTS header with 2-year max-age, subdomains, preload
- Security headers on all routes (`/(.*)`)

### Push Notification Security

- VAPID key-pair authentication
- Subscriptions tied to `auth.uid()` (RLS-protected table)
- Emergency alerts use `requireInteraction: true`

### Offline Caching

- IndexedDB primary store with `localStorage` fallback
- Stale-while-revalidate pattern
- No sensitive credentials cached (only announcement data)

---

## Attack-Resistance Testing Summary

### SQLi Testing
- Tested `' OR 1=1 --`, `'; DROP TABLE students; --`, `UNION SELECT`, statement stacking
- All rejected at client validation or treated as literal strings by PostgREST

### IDOR Testing
- Tested cross-user profile access (read/update/delete)
- All blocked by RLS policy `auth.uid() = auth_id`
- Authenticated students cannot modify other students' data or announcements

### Concurrency Approach
- Supabase connection pooling handles concurrent connections
- Realtime channels broadcast changes efficiently
- No custom rate-limiting needed at application layer (Supabase handles at platform level)

---

## Contribution Statement

**Individual Contributions:**

1. **Architecture Design** — Designed single-codebase architecture (no separate user/admin deployments), chose Supabase for unified Auth + Database + Realtime, selected Vercel for edge deployment with security headers.

2. **Database Schema & RLS** — Created `supabase/schema.sql` with `students` and `announcements` tables, enabled Row Level Security on all tables, defined policies for student/role-based access, implemented auto-profile trigger on signup.

3. **Security Headers** — Created `vercel.json` with X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, HSTS, and Referrer-Policy on all routes.

4. **Authentication Flow** — Standardized institutional email mapping (`{index}@upsamail.edu.gh`), implemented 8-digit index validation, password complexity rules, unified sign-in/sign-up in `AuthPortal.jsx`.

5. **Session Management** — Created `src/lib/session.js` with auto-refresh tokens, auto sign-out on expiry/invalidation, secure token handling (no plaintext storage).

6. **Admin Access Control** — Created `AdminRoute.jsx` RBAC wrapper, integrated into `Dashboard.jsx` publishing form, admin-only announcement creation.

7. **Push Notifications** — Created `public/sw.js` service worker, `src/lib/push.js` push subscription service, emergency alert realtime channel, VAPID key support.

8. **Emergency Alert Pipeline** — Created `EmergencyAlertBanner.jsx` with distinct visual indicators, priority routing in database, `requireInteraction: true` for emergency push notifications.

9. **Offline Caching** — Extended `offlineCache.js` usage in Dashboard with stale-while-revalidate, connection status indicator, cached data served when offline.

10. **Documentation** — Created `SECURITY.md` (SQLi, IDOR, TLS, RBAC), `DEPLOYMENT.md` (hardening checklist), `ACCESSIBILITY.md` (WCAG 2.1 AA audit), `FINAL-DELIVERABLES.md` (presentation structure).

---

## Verification Checklist

- [ ] `npm run build` passes without errors
- [ ] `supabase/schema.sql` ready for Supabase SQL Editor
- [ ] `vercel.json` security headers configured
- [ ] All environment variables documented in `.env.example`
- [ ] Accessibility audit completed (WCAG 2.1 AA)
- [ ] Security documentation complete (SQLi, IDOR, TLS, RBAC)
- [ ] Deployment checklist prepared

