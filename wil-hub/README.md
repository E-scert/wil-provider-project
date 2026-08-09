# WIL Hub

A full-stack Work-Integrated-Learning placement platform: Node/Express + PostgreSQL (your local
`psql`, no Supabase) on the backend, React (Vite + Tailwind) on the frontend. Four roles —
student, company, institution, super admin — with real JWT authentication (bcrypt-hashed
passwords, signed sessions), skill-based auto-matching, and full placement/report tracking.

```
wil-hub/
├── server/          Express API + PostgreSQL
│   ├── db/
│   │   ├── schema.sql                    your exact migration, unmodified
│   │   ├── optional-schema-additions.sql documented, NOT applied automatically
│   │   └── seed.js                       creates the one super_admin account
│   └── src/
│       ├── routes/       one file per resource
│       ├── middleware/   auth (JWT), role gating, file upload
│       └── utils/        matching algorithm, error formatting, entity lookups
└── client/          React (Vite + Tailwind)
    └── src/
        ├── api/           one file per resource, mirrors the server routes
        ├── context/       auth session + toast notifications
        ├── components/    Navbar, ProtectedRoute, shared UI primitives
        └── pages/         landing/auth pages + one folder per role's dashboards
```

## 1. Database setup (your local Postgres)

```bash
createdb wil_hub_db
psql -d wil_hub_db -f server/db/schema.sql
```

That's your exact migration file, run as-is — nothing added or changed.

## 2. Backend setup

```bash
cd server
npm install
cp .env.example .env   # edit PGUSER/PGPASSWORD for your local Postgres, and set a real JWT_SECRET
npm run seed            # creates the super_admin login (see console output for credentials)
npm run dev              # nodemon, or `npm start` for plain node
```

The API listens on `http://localhost:5000`. `GET /api/health` for a quick check.

`.env` fields:
```
PGHOST=localhost
PGPORT=5432
PGDATABASE=wil_hub_db
PGUSER=postgres
PGPASSWORD=your_password_here
PORT=5000
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
```
Generate a real secret with: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

### How auth works here (no Supabase, so this is genuinely custom)
- Passwords are hashed server-side with **bcrypt** (real hashing, real salting — this is actual
  security, not the Supabase-duplicate situation from a different project). Nothing sensitive
  ever reaches the client.
- Login issues a **JWT** containing `{ user_id, email, role, linked_id }`, signed with
  `JWT_SECRET`. Every protected route reads this from `Authorization: Bearer <token>`.
- `users.linked_id` points to `students`/`companies`/`institutions` depending on `role`, but
  Postgres can't natively enforce a "one column, three possible target tables" foreign key —
  that's a real limitation of the schema, not something this app can fix without adding
  columns. It's enforced at the application layer instead: `linked_id` is always written in the
  same database transaction as the row it points to (see `server/src/routes/auth.routes.js`),
  so the two can't drift apart under normal operation.

### CV uploads
Stored on local disk at `server/src/uploads/cvs/`, served statically at `/uploads/cvs/<file>`.
5MB limit, PDF/Word only. Fine for a local trial; swap for S3/Cloud Storage before any real
deployment, since local disk storage won't survive a redeploy or scale past one server.

## 3. Frontend setup

```bash
cd client
npm install
npm run dev
```

Opens on `http://localhost:5173`. Vite's dev proxy forwards `/api/*` and `/uploads/*` to
`http://localhost:5000` (see `vite.config.js`) — no CORS setup needed in development.

## 4. Logging in

- **Super admin**: whatever `npm run seed` printed (defaults to `admin@wilhub.local` /
  `ChangeMe123!` if you didn't set `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` in `.env` —
  change that password if you keep the default).
- **Everyone else**: self-register from the landing page (`/register`) — student, company, or
  institution.

## 5. A schema gap you should know about

**`students` has no column linking a student to a specific institution.** The spec says
"institution admin sees a list of students registered under their institution," but nothing in
the schema records which institution a student belongs to — `institution_id` only appears on
`matches`, `placements`, and `reports`, scoped to one record at a time, not as a student's fixed
"home institution."

For this MVP (a single-institution pilot, which is what a trial deployment looks like anyway),
institution admins see the **full student pool** — there's only one institution, so "all
students" and "students under my institution" are the same set. If you go multi-institution
later, `server/db/optional-schema-additions.sql` documents the exact column to add
(`students.institution_id`) and what else needs to change — it's not applied automatically,
since that's a real decision about your data model, not mine to make silently.

## 6. Design choices worth knowing about

- **Institution self-registration is open for this demo** (`/register/institution`) so the
  whole workflow is testable end to end without a separate seeding step per institution. In a
  real deployment, institution admin accounts should be **provisioned by the super admin**
  instead — a random visitor shouldn't be able to spin one up and start "verifying" students.
  This is called out in the UI too.
- **`posting_status` has no "rejected" value** (only `pending` / `approved` / `closed` — that's
  your schema's constraint). A non-compliant posting is **closed** instead of rejected, which
  removes it from public listings. Functionally equivalent, just different wording.
- **Auto-matching** (`POST /api/institutions/me/generate-matches`) proposes a match wherever a
  student's `skills[]` and a program's `required_skills[]` overlap (Postgres's `&&` array
  operator), for any approved program with open slots. It's additive and safe to run
  repeatedly — it skips any student+program pair that already has a match of any status, so it
  only ever proposes genuinely new pairs. Skills are lowercased on save specifically so this
  matching isn't broken by inconsistent capitalization.
- **Selecting an applicant** (`PATCH /api/applications/:id/status` with `status: "selected"`)
  atomically decrements `wil_programs.slots_open` and creates the `placements` row in a single
  transaction — verified during testing that a placement is never created without the slot
  being consumed, and vice versa.

## 7. Feature → route map

| Role | Feature | Frontend route | API |
|---|---|---|---|
| Public | Browse open programs | `/programs` | `GET /api/programs` |
| Student | Profile + CV upload | `/student` | `GET/PUT /api/students/me`, `POST /api/students/me/cv` |
| Student | Suggested matches | `/student/matches` | `GET /api/students/me/matches` |
| Student | My applications | `/student/applications` | `GET /api/students/me/applications` |
| Student | My placement | `/student/placements` | `GET /api/students/me/placements` |
| Student | Apply to a program | (from Browse/Matches) | `POST /api/applications` |
| Company | Profile | `/company` | `GET/PUT /api/companies/me` |
| Company | Post & list programs | `/company/programs` | `POST/GET /api/companies/me/programs` |
| Company | Review applicants | `/company/applicants` | `GET /api/companies/me/applicants`, `PATCH /api/applications/:id/status` |
| Company | Placements | `/company/placements` | `GET /api/companies/me/placements` |
| Institution | Overview | `/institution` | aggregates several endpoints |
| Institution | Verify student eligibility | `/institution/students` | `GET /api/institutions/students`, `PATCH /api/institutions/students/:id/eligibility` |
| Institution | Review postings | `/institution/programs` | `GET /api/institutions/programs`, `PATCH .../approve`, `PATCH .../close` |
| Institution | Run & validate matches | `/institution/matches` | `POST /api/institutions/me/generate-matches`, `GET /api/institutions/me/matches`, `PATCH /api/institutions/matches/:id/status` |
| Institution | Track placements | `/institution/placements` | `GET/PATCH /api/institutions/(me/placements\|placements/:id)` |
| Institution | Generate reports | `/institution/reports` | `GET/POST /api/institutions/me/reports` |
| Super Admin | Platform overview | `/admin` | `GET /api/admin/overview` |
| Super Admin | Verify companies | `/admin/companies` | `GET /api/admin/companies`, `PATCH /api/admin/companies/:id/verify` |
| Super Admin | View institutions | `/admin/institutions` | `GET /api/admin/institutions` |
| Super Admin | View all accounts | `/admin/users` | `GET /api/admin/users` |

## 8. What was verified before delivery

This was run end to end against a real local Postgres 16 database, not just written and hoped
for: schema loaded cleanly, both `npm run build`s (server module loading, client Vite build)
succeeded, and the **entire workflow** was exercised via `curl` in one continuous session —
register institution → register company → register student → company posts a program →
institution approves it → institution verifies the student → auto-matching correctly proposed a
match based on skill overlap → institution approved the match → program appeared in public
listings → student applied → company saw the applicant → company selected them (confirmed this
correctly decremented `slots_open` and created a placement in the same transaction) →
institution updated placement dates/status → institution generated a report → super admin
logged in and saw accurate platform-wide counts. The Vite dev proxy was also confirmed to
correctly forward `/api` calls through to Express.
