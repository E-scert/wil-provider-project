-- =====================================================================
-- OPTIONAL — NOT applied automatically, and not required for this MVP.
-- Your exact schema.sql is used as-is. This file documents a real gap
-- for when/if you need it, so it's a deliberate decision on your part.
-- =====================================================================

-- Gap: `students` has no column linking a student to a specific
-- institution. The spec says "institution admin sees a list of students
-- registered under their institution" — but nothing in the schema
-- records which institution a student belongs to. `institution_id`
-- only appears on `matches`, `placements`, and `reports`, each scoped
-- to one match/placement/report, not to the student's home institution.
--
-- For a single-institution pilot (one TUT-style deployment), this
-- doesn't matter — there's only one institution, so "all students" and
-- "students under my institution" are the same set. That's what this
-- MVP assumes: institution admins see the full student pool.
--
-- If you go multi-institution, add this:

ALTER TABLE students ADD COLUMN institution_id INT REFERENCES institutions(institution_id);
CREATE INDEX idx_students_institution ON students(institution_id);

-- ...and update the student registration flow to set it (e.g. from a
-- dropdown of institutions, or an invite-code/email-domain match), and
-- scope GET /api/institutions/me/students by it server-side.

-- =====================================================================
-- Second, smaller note: `users.linked_id` is a "points to one of three
-- different tables depending on role" foreign key, which Postgres has
-- no native way to enforce (a single FK column can only reference one
-- table). This app enforces the link at the application layer instead
-- (see server/src/routes/auth.routes.js) — always writing linked_id in
-- the same request that creates the students/companies/institutions
-- row, inside a transaction, so the two can't drift apart under normal
-- operation. Just flagging that Postgres itself isn't the one
-- guaranteeing that consistency here, the app code is.
-- =====================================================================
