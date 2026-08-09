const express = require('express');
const { pool } = require('../db');
const { asyncHandler, AppError, formatPgError } = require('../utils/errors');
const { requireAuth, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();
router.use(requireAuth, requireRole('student'));

function parseSkills(input) {
  if (!input) return [];
  const arr = Array.isArray(input) ? input : String(input).split(',');
  // lowercased so skill matching (students.skills && programs.required_skills) is reliable
  // regardless of how each side capitalized things
  return arr.map((s) => s.trim().toLowerCase()).filter(Boolean);
}

// GET /api/students/me
router.get('/me', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM students WHERE student_id = $1', [req.user.linked_id]);
  if (!rows[0]) throw new AppError(404, 'Student profile not found.');
  res.json(rows[0]);
}));

// PUT /api/students/me
router.put('/me', asyncHandler(async (req, res) => {
  const { name, programOfStudy, graduationYear, skills, availabilityDate } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE students
       SET name = COALESCE($1, name),
           program_of_study = COALESCE($2, program_of_study),
           graduation_year = COALESCE($3, graduation_year),
           skills = COALESCE($4, skills),
           availability_date = COALESCE($5, availability_date)
       WHERE student_id = $6
       RETURNING *`,
      [name, programOfStudy, graduationYear, skills !== undefined ? parseSkills(skills) : null, availabilityDate, req.user.linked_id]
    );
    if (!rows[0]) throw new AppError(404, 'Student profile not found.');
    res.json(rows[0]);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(400, formatPgError(err));
  }
}));

// POST /api/students/me/cv  (multipart/form-data, field name "cv")
router.post('/me/cv', upload.single('cv'), asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError(400, 'No file uploaded (expected field name "cv").');
  const cvUrl = `/uploads/cvs/${req.file.filename}`;
  const { rows } = await pool.query(
    `UPDATE students SET cv_url = $1 WHERE student_id = $2 RETURNING *`,
    [cvUrl, req.user.linked_id]
  );
  res.json(rows[0]);
}));

// GET /api/students/me/applications
router.get('/me/applications', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT a.*, p.title, p.description, p.duration_months, c.name AS company_name
     FROM applications a
     JOIN wil_programs p ON p.program_id = a.program_id
     JOIN companies c ON c.company_id = p.company_id
     WHERE a.student_id = $1
     ORDER BY a.date_applied DESC`,
    [req.user.linked_id]
  );
  res.json(rows);
}));

// GET /api/students/me/matches
router.get('/me/matches', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT m.*, p.title, p.required_skills, c.name AS company_name, i.name AS institution_name
     FROM matches m
     JOIN wil_programs p ON p.program_id = m.program_id
     JOIN companies c ON c.company_id = p.company_id
     JOIN institutions i ON i.institution_id = m.institution_id
     WHERE m.student_id = $1
     ORDER BY m.date_matched DESC`,
    [req.user.linked_id]
  );
  res.json(rows);
}));

// GET /api/students/me/placements
router.get('/me/placements', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT pl.*, p.title, c.name AS company_name
     FROM placements pl
     JOIN wil_programs p ON p.program_id = pl.program_id
     JOIN companies c ON c.company_id = pl.company_id
     WHERE pl.student_id = $1
     ORDER BY pl.start_date DESC NULLS LAST`,
    [req.user.linked_id]
  );
  res.json(rows);
}));

module.exports = router;
