const express = require('express');
const { pool } = require('../db');
const { asyncHandler, AppError, formatPgError } = require('../utils/errors');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireRole('company_admin'));

function parseSkills(input) {
  if (!input) return [];
  const arr = Array.isArray(input) ? input : String(input).split(',');
  // lowercased so skill matching (students.skills && programs.required_skills) is reliable
  // regardless of how each side capitalized things
  return arr.map((s) => s.trim().toLowerCase()).filter(Boolean);
}

// GET /api/companies/me
router.get('/me', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM companies WHERE company_id = $1', [req.user.linked_id]);
  if (!rows[0]) throw new AppError(404, 'Company profile not found.');
  res.json(rows[0]);
}));

// PUT /api/companies/me
router.put('/me', asyncHandler(async (req, res) => {
  const { name, industry, contactPerson } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE companies
       SET name = COALESCE($1, name), industry = COALESCE($2, industry), contact_person = COALESCE($3, contact_person)
       WHERE company_id = $4 RETURNING *`,
      [name, industry, contactPerson, req.user.linked_id]
    );
    if (!rows[0]) throw new AppError(404, 'Company profile not found.');
    res.json(rows[0]);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(400, formatPgError(err));
  }
}));

// POST /api/companies/me/programs — always starts as posting_status = 'pending'
router.post('/me/programs', asyncHandler(async (req, res) => {
  const { title, description, requiredSkills, slotsOpen, durationMonths, openDate, closeDate } = req.body;
  if (!title || !slotsOpen || !durationMonths) {
    throw new AppError(400, 'title, slotsOpen, and durationMonths are required.');
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO wil_programs (company_id, title, description, required_skills, slots_open, duration_months, open_date, close_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.linked_id, title, description || null, parseSkills(requiredSkills), slotsOpen, durationMonths, openDate || null, closeDate || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    throw new AppError(400, formatPgError(err));
  }
}));

// GET /api/companies/me/programs
router.get('/me/programs', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM wil_programs WHERE company_id = $1 ORDER BY program_id DESC`,
    [req.user.linked_id]
  );
  res.json(rows);
}));

// GET /api/companies/me/applicants — every applicant across all of this company's programs
router.get('/me/applicants', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT a.application_id, a.status, a.date_applied,
            p.program_id, p.title AS program_title,
            s.student_id, s.name AS student_name, s.email AS student_email,
            s.program_of_study, s.skills, s.eligibility_status, s.cv_url
     FROM applications a
     JOIN wil_programs p ON p.program_id = a.program_id
     JOIN students s ON s.student_id = a.student_id
     WHERE p.company_id = $1
     ORDER BY a.date_applied DESC`,
    [req.user.linked_id]
  );
  res.json(rows);
}));

// GET /api/companies/me/placements
router.get('/me/placements', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT pl.*, p.title, s.name AS student_name
     FROM placements pl
     JOIN wil_programs p ON p.program_id = pl.program_id
     JOIN students s ON s.student_id = pl.student_id
     WHERE pl.company_id = $1
     ORDER BY pl.start_date DESC NULLS LAST`,
    [req.user.linked_id]
  );
  res.json(rows);
}));

module.exports = router;
