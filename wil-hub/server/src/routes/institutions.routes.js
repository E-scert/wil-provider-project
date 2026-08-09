const express = require('express');
const { pool, withTransaction } = require('../db');
const { asyncHandler, AppError, formatPgError } = require('../utils/errors');
const { requireAuth, requireRole } = require('../middleware/auth');
const { generateMatches } = require('../utils/matching');

const router = express.Router();
router.use(requireAuth, requireRole('institution_admin'));

// ---------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------
router.get('/me', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM institutions WHERE institution_id = $1', [req.user.linked_id]);
  if (!rows[0]) throw new AppError(404, 'Institution profile not found.');
  res.json(rows[0]);
}));

router.put('/me', asyncHandler(async (req, res) => {
  const { name, contactPerson } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE institutions SET name = COALESCE($1, name), contact_person = COALESCE($2, contact_person)
       WHERE institution_id = $3 RETURNING *`,
      [name, contactPerson, req.user.linked_id]
    );
    res.json(rows[0]);
  } catch (err) {
    throw new AppError(400, formatPgError(err));
  }
}));

// ---------------------------------------------------------------------
// 1. Student eligibility
// (Full student pool — see db/optional-schema-additions.sql for the
// multi-institution scoping note.)
// ---------------------------------------------------------------------
router.get('/students', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM students ORDER BY student_id DESC');
  res.json(rows);
}));

router.patch('/students/:id/eligibility', asyncHandler(async (req, res) => {
  const { eligibilityStatus } = req.body;
  if (!['provisional', 'verified'].includes(eligibilityStatus)) {
    throw new AppError(400, "eligibilityStatus must be 'provisional' or 'verified'.");
  }
  const { rows } = await pool.query(
    'UPDATE students SET eligibility_status = $1 WHERE student_id = $2 RETURNING *',
    [eligibilityStatus, req.params.id]
  );
  if (!rows[0]) throw new AppError(404, 'Student not found.');
  res.json(rows[0]);
}));

// ---------------------------------------------------------------------
// 2. Company postings — compliance review
// ---------------------------------------------------------------------
router.get('/programs', asyncHandler(async (req, res) => {
  const { status } = req.query; // optional filter: pending | approved | closed
  const params = [];
  let where = '';
  if (status) {
    params.push(status);
    where = 'WHERE p.posting_status = $1';
  }
  const { rows } = await pool.query(
    `SELECT p.*, c.name AS company_name, c.verified_status
     FROM wil_programs p JOIN companies c ON c.company_id = p.company_id
     ${where}
     ORDER BY p.program_id DESC`,
    params
  );
  res.json(rows);
}));

router.patch('/programs/:id/approve', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE wil_programs SET posting_status = 'approved' WHERE program_id = $1 RETURNING *`,
    [req.params.id]
  );
  if (!rows[0]) throw new AppError(404, 'Program not found.');
  res.json(rows[0]);
}));

// There's no "rejected" posting_status in the schema (only pending/approved/closed) — a
// non-compliant posting is closed instead, which removes it from the public listing.
router.patch('/programs/:id/close', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE wil_programs SET posting_status = 'closed' WHERE program_id = $1 RETURNING *`,
    [req.params.id]
  );
  if (!rows[0]) throw new AppError(404, 'Program not found.');
  res.json(rows[0]);
}));

// ---------------------------------------------------------------------
// 3. Matches
// ---------------------------------------------------------------------
router.post('/me/generate-matches', asyncHandler(async (req, res) => {
  const created = await generateMatches(pool, req.user.linked_id);
  res.status(201).json({ createdCount: created.length, matches: created });
}));

router.get('/me/matches', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT m.*, s.name AS student_name, s.email AS student_email, s.skills, s.eligibility_status,
            p.title AS program_title, p.required_skills, c.name AS company_name
     FROM matches m
     JOIN students s ON s.student_id = m.student_id
     JOIN wil_programs p ON p.program_id = m.program_id
     JOIN companies c ON c.company_id = p.company_id
     WHERE m.institution_id = $1
     ORDER BY m.date_matched DESC`,
    [req.user.linked_id]
  );
  res.json(rows);
}));

router.patch('/matches/:id/status', asyncHandler(async (req, res) => {
  const { matchStatus } = req.body;
  if (!['approved', 'rejected'].includes(matchStatus)) {
    throw new AppError(400, "matchStatus must be 'approved' or 'rejected'.");
  }
  const { rows } = await pool.query(
    `UPDATE matches SET match_status = $1 WHERE match_id = $2 AND institution_id = $3 RETURNING *`,
    [matchStatus, req.params.id, req.user.linked_id]
  );
  if (!rows[0]) throw new AppError(404, 'Match not found (or does not belong to your institution).');
  res.json(rows[0]);
}));

// ---------------------------------------------------------------------
// 4. Placements
// ---------------------------------------------------------------------
router.get('/me/placements', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT pl.*, s.name AS student_name, p.title AS program_title, c.name AS company_name
     FROM placements pl
     JOIN students s ON s.student_id = pl.student_id
     JOIN wil_programs p ON p.program_id = pl.program_id
     JOIN companies c ON c.company_id = pl.company_id
     WHERE pl.institution_id = $1
     ORDER BY pl.start_date DESC NULLS LAST`,
    [req.user.linked_id]
  );
  res.json(rows);
}));

router.patch('/placements/:id', asyncHandler(async (req, res) => {
  const { startDate, endDate, completionStatus } = req.body;
  if (completionStatus && !['ongoing', 'completed', 'failed'].includes(completionStatus)) {
    throw new AppError(400, "completionStatus must be one of: ongoing, completed, failed.");
  }
  const { rows } = await pool.query(
    `UPDATE placements
     SET start_date = COALESCE($1, start_date),
         end_date = COALESCE($2, end_date),
         completion_status = COALESCE($3, completion_status)
     WHERE placement_id = $4 AND institution_id = $5
     RETURNING *`,
    [startDate || null, endDate || null, completionStatus || null, req.params.id, req.user.linked_id]
  );
  if (!rows[0]) throw new AppError(404, 'Placement not found (or does not belong to your institution).');
  res.json(rows[0]);
}));

// ---------------------------------------------------------------------
// 5. Reports
// ---------------------------------------------------------------------
router.get('/me/reports', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT r.*, s.name AS student_name, p.title AS program_title
     FROM reports r
     JOIN placements pl ON pl.placement_id = r.placement_id
     JOIN students s ON s.student_id = pl.student_id
     JOIN wil_programs p ON p.program_id = pl.program_id
     WHERE r.institution_id = $1
     ORDER BY r.report_id DESC`,
    [req.user.linked_id]
  );
  res.json(rows);
}));

router.post('/me/reports', asyncHandler(async (req, res) => {
  const { placementId, graduationImpact, notes } = req.body;
  if (!placementId) throw new AppError(400, 'placementId is required.');

  const { rows: placementRows } = await pool.query(
    'SELECT * FROM placements WHERE placement_id = $1 AND institution_id = $2',
    [placementId, req.user.linked_id]
  );
  if (!placementRows[0]) throw new AppError(404, 'Placement not found (or does not belong to your institution).');

  const { rows } = await pool.query(
    `INSERT INTO reports (placement_id, institution_id, graduation_impact, notes)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [placementId, req.user.linked_id, !!graduationImpact, notes || null]
  );
  res.status(201).json(rows[0]);
}));

module.exports = router;
