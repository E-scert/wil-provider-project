# WIL Connect — TUT WIL Provider Platform

React (Vite) + TailwindCSS frontend, backed directly by Supabase (Postgres + Auth + Storage)
using your schema as-is — no tables or columns were added or changed.

```
wil-platform/
├── src/
│   ├── lib/supabaseClient.js       Supabase client singleton
│   ├── api/                        one file per table/domain (students, companies, programs, etc.)
│   ├── context/                    AuthContext (session + role), ToastContext
│   ├── components/                 Navbar, ProtectedRoute, Modal, shared UI primitives
│   └── pages/                      Landing/listings, auth, student/company/admin dashboards
└── supabase/
    ├── recommended-fixes.sql       required RLS policy additions (read this first)
    └── storage-policies.sql        student-vault bucket + access policies
```

## ⚠️ Read this before running anything

Your schema, as posted, **will not let students or companies sign up, edit their own
profile, manage skills, or upload documents** — not because of anything in this codebase,
but because the RLS policies that ship with the schema only grant:

- **SELECT** on your own `student` / `company` / `stud_details` / `stud_docs` row, and
- a couple of narrow **INSERT** policies (applying to programs, posting programs),
- plus **admin-only** `FOR ALL` policies on everything.

There is no policy anywhere that lets a normal authenticated (non-admin) user **INSERT**
their own row into `users`, `student`, or `company` — which signup needs on the very first
write — or **UPDATE** their own profile, address, or skills, which "profile edit" needs.
`stud_skill_map` has no non-admin policies at all. Companies can view applicants but have no
UPDATE policy to actually accept/reject them.

I didn't invent new tables or columns to work around this. Instead, **`supabase/recommended-fixes.sql`**
adds exactly the missing `INSERT`/`UPDATE`/`SELECT` policies, following the same
`auth.uid() = ...` pattern your existing policies already use, plus one more thing:

**`auto_link_student_docs_trigger` will error on every insert as currently written.** Its
function reads `NEW.name`, but `stud_docs` has no `name` column — that column only exists on
Supabase's internal `storage.objects` table, which is clearly what the function was originally
designed for. As attached (to `stud_docs`, not `storage.objects`), it throws `record "new" has
no field "name"` the moment anything is inserted into `stud_docs`. This app writes document
paths into `stud_docs` directly after a successful Storage upload (see `src/api/storage.js`),
so the trigger isn't needed — `recommended-fixes.sql` drops it.

**Run `supabase/recommended-fixes.sql` and `supabase/storage-policies.sql` in the Supabase SQL
editor before testing signup/profile/upload flows.** Nothing else in your schema is touched.

### One more schema note: `password_hash`

`users.password_hash` is `NOT NULL`, but Supabase Auth already stores credentials securely
(hashed + salted) in its own internal `auth.users` table — which is what this app actually
uses to log in. `password_hash` here is redundant with that. The app populates it with a
client-side SHA-256 digest purely to satisfy the `NOT NULL` constraint (see the comment in
`src/api/auth.js`); it is **not** used to verify logins anywhere and isn't meaningful security
on its own. If you don't need it for something else, the cleanest fix is dropping the column
and relying on Supabase Auth entirely, which is what effectively already happens here.

## 1. Supabase project setup

1. Create a Supabase project (if you haven't) and confirm your existing schema is applied.
2. In the SQL editor, run `supabase/recommended-fixes.sql`, then `supabase/storage-policies.sql`.
3. Project Settings → API: copy your Project URL and anon public key.
4. If your project requires email confirmation for signup, either disable it for local testing
   (Authentication → Providers → Email → "Confirm email" toggle) or check your inbox after
   signing up before trying to log in.

## 2. Frontend setup

```bash
cd wil-platform
npm install
cp .env.example .env   # then paste in your Supabase URL + anon key
npm run dev
```

Opens on `http://localhost:5173`.

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

For production, `npm run build` outputs static files in `dist/` — deploy that to any static
host (Vercel, Netlify, Cloudflare Pages, etc.) with the same two env vars set in the host's
environment settings.

## 3. How auth/roles work

- Signup (`/signup/student`, `/signup/company`) calls `supabase.auth.signUp()` to create the
  real Supabase Auth identity, then inserts the matching `users` row using **the same id as
  the auth user** (`auth.uid()`) — this is what makes every `auth.uid() = user_id` policy in
  your schema actually match. It then inserts the role-specific profile row.
- Login resolves the user's role by reading their `users.user_type`, then loads their
  `student` or `company` profile row. `AuthContext` exposes `{ session, role, profile }` app-wide.
- `ProtectedRoute` redirects unauthenticated visitors to `/login`, and can further restrict a
  route to specific roles (e.g. `allow={['admin']}`).
- The public program listings page (`/programs`) needs no login; applying to a program does.

## 4. Feature → file map

| Feature | Route | File |
|---|---|---|
| Public program listings + apply | `/programs` | `pages/ProgramListings.jsx` |
| Login | `/login` | `pages/Login.jsx` |
| Student signup | `/signup/student` | `pages/SignupStudent.jsx` |
| Company signup | `/signup/company` | `pages/SignupCompany.jsx` |
| Student profile view/edit + skills | `/student` | `pages/student/StudentDashboard.jsx` |
| Student document upload (student-vault) | `/student/documents` | `pages/student/StudentDocuments.jsx` |
| Student's own applications | `/student/applications` | `pages/student/StudentApplications.jsx` |
| Company profile + address | `/company` | `pages/company/CompanyDashboard.jsx` |
| Post / list programs | `/company/programs` | `pages/company/CompanyPrograms.jsx` |
| View + accept/reject applicants | `/company/applicants` | `pages/company/CompanyApplicants.jsx` |
| Admin: table picker | `/admin` | `pages/admin/AdminOverview.jsx` |
| Admin: CRUD any table | `/admin/table/:table` | `pages/admin/AdminTable.jsx` (generic, driven by `api/admin.js`'s `ADMIN_TABLES` registry) |

## 5. What was verified

`npm install` and `npm run build` were run against this exact codebase and completed with no
errors (Vite bundled all 101 modules cleanly). Live Supabase calls couldn't be exercised end to
end from this environment (no real project/credentials available here), so double-check the
signup → profile-edit → document-upload → apply-to-program flow against your own project after
applying `recommended-fixes.sql` — that's the flow most exposed to the RLS gaps described above.
