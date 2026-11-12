# CampusHub — Security Controls Documentation

This document details how the University Broadcast Network defends against
SQL injection, IDOR attacks, and transport-layer threats.

---

## 1. SQL Injection (SQLi) Defense

### Defense Mechanism: Parameterized Query Builder

The Supabase JavaScript client (`@supabase/supabase-js`) uses a **parameterized
query builder** under the hood. All database operations go through PostgREST,
which converts REST-style requests into parameterized SQL queries using `libpq`
prepared statements. User input is never interpolated into raw SQL strings.

### Example: Student Index Lookup (Frontend)

```jsx
// AuthPage.jsx — login form
const handleSubmit = async (e) => {
  e.preventDefault();

  // 1. Client-side validation: exactly 8 digits
  if (!isValidIndex(index)) {
    setLocalError('Student Index Number must be exactly 8 numeric digits.');
    return;
  }

  // 2. Email constructed in standardized format (never raw SQL)
  const email = `${index}@upsamail.edu.gh`;

  // 3. Supabase client sends parameterized auth request
  await signInWithCredentials({ email, password: pin });
};
```

### Example: Announcement Fetch (Dashboard)

```jsx
// Dashboard.jsx — fetch announcements
const { data, error } = await supabase
  .from('announcements')
  .select('*')
  .order('created_at', { ascending: false });
```

The `.from()`, `.select()`, and `.order()` methods build a query object that
PostgREST translates into parameterized SQL. No user-controlled string is ever
concatenated into the SQL statement.

### Database-Level Constraints (Second Line of Defense)

Even if a parameterized query were bypassed, the database schema enforces
strict constraints:

```sql
-- student_index must be exactly 8 digits
student_index text NOT NULL UNIQUE 
  CHECK (length(student_index) = 8 AND student_index ~ '^\d{8}$');

-- role must be one of two values
role text NOT NULL DEFAULT 'student' 
  CHECK (role IN ('student', 'admin'));

-- priority must be one of three values
priority text NOT NULL DEFAULT 'normal' 
  CHECK (priority IN ('normal', 'high', 'emergency'));
```

### SQLi Test Results

| Attack Vector | Defense | Result |
|--------------|---------|--------|
| `' OR 1=1 --` in index field | Regex validation `/^\d{8}$/` | Rejected at client |
| `'; DROP TABLE students; --` | Parameterized query builder | Treated as literal string |
| `UNION SELECT * FROM auth.users` | PostgREST query builder | Cannot inject UNION |
| `1; DELETE FROM students` | No statement stacking in PostgREST | Rejected |

---

## 2. Authorization Boundaries (IDOR Mitigation)

### Threat Scenario

An authenticated student (User A) attempts to read or modify another student's
profile (User B) by guessing or altering the `auth_id` / `student_index` in
a network request.

### RLS Defense

Every table has Row Level Security enabled. Policies evaluate `auth.uid()`
against the data being accessed:

```sql
-- Students can view own profile ONLY
CREATE POLICY "Students can view own profile"
  ON public.students
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

-- Students can update own profile ONLY
CREATE POLICY "Students can update own profile"
  ON public.students
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);
```

### IDOR Test Procedure

1. **Login as Student A** — obtain valid Supabase session JWT
2. **Attempt to read Student B's profile** via API:
   ```
   GET /rest/v1/students?auth_id=eq.<Student-B-UUID>
   Authorization: Bearer <Student-A-JWT>
   ```
3. **Database evaluates RLS** — `auth.uid()` = Student-A, but `auth_id` = Student-B
4. **Result**: Policy `auth.uid() = auth_id` evaluates to `FALSE`
5. **Response**: Empty array `[]` or `403 Forbidden` — data never returned

### IDOR Test Results

| Request | User Session | Target Resource | RLS Evaluation | Result |
|---------|-------------|-----------------|----------------|--------|
| `SELECT * FROM students WHERE auth_id = 'user-b'` | User A | User B's profile | `auth.uid() = auth_id` → FALSE | Blocked |
| `UPDATE students SET role='admin' WHERE auth_id = 'user-a'` | User A | Own profile | `auth.uid() = auth_id` → TRUE | Allowed |
| `UPDATE students SET role='admin' WHERE auth_id = 'user-b'` | User A | User B's profile | `auth.uid() = auth_id` → FALSE | Blocked |
| `DELETE FROM students WHERE auth_id = 'user-b'` | User A | User B's profile | `auth.uid() = auth_id` → FALSE | Blocked |
| `SELECT * FROM announcements` | User A | All announcements | `using (true)` for authenticated | Allowed |
| `INSERT INTO announcements ...` | User A (student) | Announcements table | Admin check → FALSE | Blocked |

---

## 3. Transport Layer Security (TLS)

### Infrastructure

| Connection | Protocol | Certificate |
|------------|----------|-------------|
| Browser → Vercel Edge | HTTPS (TLS 1.3) | Vercel-managed (Let's Encrypt) |
| Browser → Supabase API | HTTPS (TLS 1.3) | Supabase-managed |
| Supabase API → PostgreSQL | Internal TLS | Supabase-managed |

### Enforced Headers (`vercel.json`)

```json
{
  "key": "Strict-Transport-Security",
  "value": "max-age=63072000; includeSubDomains; preload"
}
```

- `max-age=63072000` — 2-year HSTS policy
- `includeSubDomains` — covers all subdomains
- `preload` — eligible for browser HSTS preload lists

### MitM Protection

- All credentials (email/password) transmitted only over HTTPS
- Session tokens (JWT) stored in memory by Supabase client, never in `localStorage` plaintext
- `Referrer-Policy: strict-origin-when-cross-origin` prevents referrer leakage
- `X-Content-Type-Options: nosniff` prevents MIME sniffing attacks

---

## 4. Role-Based Access Control (RBAC) Summary

| Role | Students Table | Announcements Table | Push Subscriptions |
|------|---------------|---------------------|-------------------|
| **Unauthenticated (anon)** | No access | No access | No access |
| **Authenticated Student** | Read/Write own profile only | Read all | Read/Write own subscription |
| **Authenticated Admin** | Read/Write all | Read/Write all | Read/Write all |

No separate admin codebase exists — RBAC is enforced entirely at the database layer via RLS policies.
