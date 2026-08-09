const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { withTransaction, pool } = require('../db');
const { asyncHandler, AppError, formatPgError } = require('../utils/errors');
const { requireAuth } = require('../middleware/auth');
const { loadEntity, loadMyEntity } = require('../utils/entities');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { user_id: user.user_id, email: user.email, role: user.role, linked_id: user.linked_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function parseSkills(input) {
  if (!input) return [];
  const arr = Array.isArray(input) ? input : String(input).split(',');
  // lowercased so skill matching (students.skills && programs.required_skills) is reliable
  // regardless of how each side capitalized things
  return arr.map((s) => s.trim().toLowerCase()).filter(Boolean);
}

// ---------------------------------------------------------------------
// POST /api/auth/register/student
// ---------------------------------------------------------------------
router.post('/register/student', asyncHandler(async (req, res) => {
  const { name, email, password, programOfStudy, graduationYear, skills, availabilityDate } = req.body;
  if (!name || !email || !password || !programOfStudy) {
    throw new AppError(400, 'name, email, password, and programOfStudy are required.');
  }
  if (password.length < 6) throw new AppError(400, 'Password must be at least 6 characters.');

  const password_hash = await bcrypt.hash(password, 10);

  try {
    const result = await withTransaction(async (client) => {
      const studentRes = await client.query(
        `INSERT INTO students (name, email, program_of_study, graduation_year, skills, availability_date)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, email, programOfStudy, graduationYear || null, parseSkills(skills), availabilityDate || null]
      );
      const student = studentRes.rows[0];

      const userRes = await client.query(
        `INSERT INTO users (email, password_hash, role, linked_id)
         VALUES ($1, $2, 'student', $3) RETURNING user_id, email, role, linked_id, created_at`,
        [email, password_hash, student.student_id]
      );
      return { user: userRes.rows[0], entity: student };
    });

    const token = signToken(result.user);
    res.status(201).json({ token, user: result.user, entity: result.entity });
  } catch (err) {
    throw new AppError(400, formatPgError(err));
  }
}));

// ---------------------------------------------------------------------
// POST /api/auth/register/company
// ---------------------------------------------------------------------
router.post('/register/company', asyncHandler(async (req, res) => {
  const { name, email, password, industry, contactPerson } = req.body;
  if (!name || !email || !password) throw new AppError(400, 'name, email, and password are required.');
  if (password.length < 6) throw new AppError(400, 'Password must be at least 6 characters.');

  const password_hash = await bcrypt.hash(password, 10);

  try {
    const result = await withTransaction(async (client) => {
      const companyRes = await client.query(
        `INSERT INTO companies (name, industry, contact_person, email) VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, industry || null, contactPerson || null, email]
      );
      const company = companyRes.rows[0];

      const userRes = await client.query(
        `INSERT INTO users (email, password_hash, role, linked_id)
         VALUES ($1, $2, 'company_admin', $3) RETURNING user_id, email, role, linked_id, created_at`,
        [email, password_hash, company.company_id]
      );
      return { user: userRes.rows[0], entity: company };
    });

    const token = signToken(result.user);
    res.status(201).json({ token, user: result.user, entity: result.entity });
  } catch (err) {
    throw new AppError(400, formatPgError(err));
  }
}));

// ---------------------------------------------------------------------
// POST /api/auth/register/institution
//
// NOTE — demo-only design choice: in a real deployment, institution admin
// accounts should be provisioned by a super admin (institutions are
// established organizations, not something a random visitor should be
// able to spin up and start "verifying" students with). This endpoint is
// open here purely so the whole workflow is testable end to end without
// needing a separate seeding step for every institution. Before going
// live, gate this behind super-admin approval instead.
// ---------------------------------------------------------------------
router.post('/register/institution', asyncHandler(async (req, res) => {
  const { name, email, password, contactPerson } = req.body;
  if (!name || !email || !password) throw new AppError(400, 'name, email, and password are required.');
  if (password.length < 6) throw new AppError(400, 'Password must be at least 6 characters.');

  const password_hash = await bcrypt.hash(password, 10);

  try {
    const result = await withTransaction(async (client) => {
      const instRes = await client.query(
        `INSERT INTO institutions (name, contact_person, email) VALUES ($1, $2, $3) RETURNING *`,
        [name, contactPerson || null, email]
      );
      const institution = instRes.rows[0];

      const userRes = await client.query(
        `INSERT INTO users (email, password_hash, role, linked_id)
         VALUES ($1, $2, 'institution_admin', $3) RETURNING user_id, email, role, linked_id, created_at`,
        [email, password_hash, institution.institution_id]
      );
      return { user: userRes.rows[0], entity: institution };
    });

    const token = signToken(result.user);
    res.status(201).json({ token, user: result.user, entity: result.entity });
  } catch (err) {
    throw new AppError(400, formatPgError(err));
  }
}));

// ---------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError(400, 'email and password are required.');

  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const userRow = rows[0];
  if (!userRow) throw new AppError(401, 'Invalid email or password.');

  const ok = await bcrypt.compare(password, userRow.password_hash);
  if (!ok) throw new AppError(401, 'Invalid email or password.');

  const publicUser = { user_id: userRow.user_id, email: userRow.email, role: userRow.role, linked_id: userRow.linked_id, created_at: userRow.created_at };
  const entity = await loadEntity(userRow.role, userRow.linked_id);
  const token = signToken(publicUser);

  res.json({ token, user: publicUser, entity });
}));

// ---------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const entity = await loadMyEntity(req);
  res.json({ user: req.user, entity });
}));

module.exports = router;
