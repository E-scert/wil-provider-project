const express = require('express');
const { pool } = require('../db');
const { asyncHandler, AppError } = require('../utils/errors');

const router = express.Router();

// GET /api/programs — public: approved, open, with slots remaining
router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT p.*, c.name AS company_name, c.industry, c.verified_status
     FROM wil_programs p
     JOIN companies c ON c.company_id = p.company_id
     WHERE p.posting_status = 'approved' AND p.slots_open > 0
     ORDER BY p.program_id DESC`
  );
  res.json(rows);
}));

// GET /api/programs/:id — public detail view
router.get('/:id', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT p.*, c.name AS company_name, c.industry, c.contact_person, c.verified_status
     FROM wil_programs p
     JOIN companies c ON c.company_id = p.company_id
     WHERE p.program_id = $1`,
    [req.params.id]
  );
  if (!rows[0]) throw new AppError(404, 'Program not found.');
  res.json(rows[0]);
}));

module.exports = router;
