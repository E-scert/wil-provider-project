const express = require("express");
const { pool } = require("../db");
const { asyncHandler, AppError } = require("../utils/errors");

const router = express.Router();

// GET /api/programs — public: approved programs
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT p.*, c.name AS company_name, c.industry, c.verified_status
     FROM wil_programs p
     JOIN companies c ON c.company_id = p.company_id
     WHERE p.posting_status = 'approved'
     ORDER BY p.program_id DESC`,
    );
    res.json(rows);
  }),
);

// GET /api/programs/:id — public detail view
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT p.*, c.name AS company_name, c.industry, c.contact_person, c.verified_status
     FROM wil_programs p
     JOIN companies c ON c.company_id = p.company_id
     WHERE p.program_id = $1`,
      [req.params.id],
    );
    if (!rows[0]) throw new AppError(404, "Program not found.");
    res.json(rows[0]);
  }),
);

// POST /api/companies/programs — company creates new program
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const {
      company_id,
      title,
      description,
      eligibleCourses,
      durationMonths,
      openDate,
      closeDate,
      applicationMethod,
      applicationEmail,
      applicationLink,
    } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO wil_programs
     (company_id, title, description, eligible_courses, duration_months, open_date, close_date, application_method, application_email, application_link)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
      [
        company_id,
        title,
        description,
        eligibleCourses.split(","),
        durationMonths || null,
        openDate || null,
        closeDate,
        applicationMethod,
        applicationEmail || null,
        applicationLink || null,
      ],
    );

    res.status(201).json(rows[0]);
  }),
);

module.exports = router;
