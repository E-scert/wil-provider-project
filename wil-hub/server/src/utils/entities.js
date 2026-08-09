const { pool } = require('../db');

const TABLE_BY_ROLE = {
  student: { table: 'students', idCol: 'student_id' },
  company_admin: { table: 'companies', idCol: 'company_id' },
  institution_admin: { table: 'institutions', idCol: 'institution_id' },
};

/** Loads the students/companies/institutions row for a given role+linked_id. Null for super_admin. */
async function loadEntity(role, linkedId) {
  const meta = TABLE_BY_ROLE[role];
  if (!meta) return null;
  const { rows } = await pool.query(`SELECT * FROM ${meta.table} WHERE ${meta.idCol} = $1`, [linkedId]);
  return rows[0] || null;
}

/** Convenience for routes: loads the entity row for the currently authenticated user. */
async function loadMyEntity(req) {
  return loadEntity(req.user.role, req.user.linked_id);
}

module.exports = { loadEntity, loadMyEntity, TABLE_BY_ROLE };
