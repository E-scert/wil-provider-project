const express = require('express');
const { pool } = require('../db');
const { asyncHandler, AppError } = require('../utils/errors');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireRole('super_admin'));

// GET /api/admin/overview — platform-wide counts for a dashboard summary
router.get('/overview', asyncHandler(async (req, res) => {
  const queries = await Promise.all([
    pool.query('SELECT count(*)::int AS n FROM users'),
    pool.query('SELECT count(*)::int AS n FROM students'),
    pool.query('SELECT count(*)::int AS n FROM companies'),
    pool.query('SELECT count(*)::int AS n FROM institutions'),
    pool.query("SELECT count(*)::int AS n FROM wil_programs WHERE posting_status = 'approved'"),
    pool.query("SELECT count(*)::int AS n FROM wil_programs WHERE posting_status = 'pending'"),
    pool.query('SELECT count(*)::int AS n FROM applications'),
    pool.query("SELECT count(*)::int AS n FROM placements WHERE completion_status = 'ongoing'"),
    pool.query("SELECT count(*)::int AS n FROM placements WHERE completion_status = 'completed'"),
  ]);
  const [users, students, companies, institutions, approvedPrograms, pendingPrograms, applications, ongoingPlacements, completedPlacements] =
    queries.map((r) => r.rows[0].n);

  res.json({ users, students, companies, institutions, approvedPrograms, pendingPrograms, applications, ongoingPlacements, completedPlacements });
}));

// GET /api/admin/institutions
router.get('/institutions', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM institutions ORDER BY institution_id DESC');
  res.json(rows);
}));

// GET /api/admin/companies
router.get('/companies', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM companies ORDER BY company_id DESC');
  res.json(rows);
}));

// PATCH /api/admin/companies/:id/verify — body { verified: boolean }
router.patch('/companies/:id/verify', asyncHandler(async (req, res) => {
  const { verified } = req.body;
  const { rows } = await pool.query(
    'UPDATE companies SET verified_status = $1 WHERE company_id = $2 RETURNING *',
    [!!verified, req.params.id]
  );
  if (!rows[0]) throw new AppError(404, 'Company not found.');
  res.json(rows[0]);
}));

// GET /api/admin/users — account list across all roles (no password hashes)
router.get('/users', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    'SELECT user_id, email, role, linked_id, created_at FROM users ORDER BY user_id DESC'
  );
  res.json(rows);
}));

module.exports = router;
