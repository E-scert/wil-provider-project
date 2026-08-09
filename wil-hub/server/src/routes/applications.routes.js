const express = require('express');
const { pool, withTransaction } = require('../db');
const { asyncHandler, AppError, formatPgError } = require('../utils/errors');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/applications  (student only) — apply to an approved, open program
router.post('/', requireAuth, requireRole('student'), asyncHandler(async (req, res) => {
  const { programId } = req.body;
  if (!programId) throw new AppError(400, 'programId is required.');

  const { rows: programRows } = await pool.query('SELECT * FROM wil_programs WHERE program_id = $1', [programId]);
  const program = programRows[0];
  if (!program) throw new AppError(404, 'Program not found.');
  if (program.posting_status !== 'approved') throw new AppError(400, 'This program is not open for applications yet.');
  if (program.slots_open <= 0) throw new AppError(400, 'This program has no open slots left.');

  const { rows: existing } = await pool.query(
    'SELECT application_id FROM applications WHERE student_id = $1 AND program_id = $2',
    [req.user.linked_id, programId]
  );
  if (existing.length) throw new AppError(409, "You've already applied to this program.");

  try {
    const { rows } = await pool.query(
      `INSERT INTO applications (student_id, program_id) VALUES ($1, $2) RETURNING *`,
      [req.user.linked_id, programId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    throw new AppError(400, formatPgError(err));
  }
}));

// PATCH /api/applications/:id/status  (company_admin only, must own the program)
// status: pending | shortlisted | selected | rejected
// Selecting a student: decrements the program's slots_open and creates a placement.
router.patch('/:id/status', requireAuth, requireRole('company_admin'), asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'shortlisted', 'selected', 'rejected'];
  if (!allowed.includes(status)) throw new AppError(400, `status must be one of: ${allowed.join(', ')}`);

  try {
    const result = await withTransaction(async (client) => {
      const { rows: appRows } = await client.query(
        `SELECT a.*, p.company_id, p.slots_open, p.title
         FROM applications a JOIN wil_programs p ON p.program_id = a.program_id
         WHERE a.application_id = $1 FOR UPDATE`,
        [req.params.id]
      );
      const application = appRows[0];
      if (!application) throw new AppError(404, 'Application not found.');
      if (application.company_id !== req.user.linked_id) {
        throw new AppError(403, 'This application is not for one of your programs.');
      }

      if (status === 'selected' && application.status !== 'selected') {
        if (application.slots_open <= 0) throw new AppError(400, 'No open slots remain for this program.');
        await client.query('UPDATE wil_programs SET slots_open = slots_open - 1 WHERE program_id = $1', [application.program_id]);

        // If an approved match exists for this student+program, attribute the placement
        // to the institution that validated it; otherwise leave institution_id null.
        const { rows: matchRows } = await client.query(
          `SELECT institution_id FROM matches WHERE student_id = $1 AND program_id = $2 AND match_status = 'approved' LIMIT 1`,
          [application.student_id, application.program_id]
        );
        const institutionId = matchRows[0]?.institution_id || null;

        await client.query(
          `INSERT INTO placements (student_id, program_id, company_id, institution_id)
           VALUES ($1, $2, $3, $4)`,
          [application.student_id, application.program_id, application.company_id, institutionId]
        );
      }

      const { rows: updated } = await client.query(
        `UPDATE applications SET status = $1 WHERE application_id = $2 RETURNING *`,
        [status, req.params.id]
      );
      return updated[0];
    });
    res.json(result);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(400, formatPgError(err));
  }
}));

module.exports = router;
