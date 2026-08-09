// Creates (or updates the password of) the platform's super_admin account.
// Run with: npm run seed
// Reads SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD from .env, or falls back to
// admin@wilhub.local / ChangeMe123! — change the password immediately if you use the default.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || 'wil_hub_db',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
});

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@wilhub.local';
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const password_hash = await bcrypt.hash(password, 10);

  const { rows: existing } = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);

  if (existing.length) {
    await pool.query('UPDATE users SET password_hash = $1, role = $2, linked_id = NULL WHERE email = $3', [
      password_hash, 'super_admin', email,
    ]);
    console.log(`Updated existing super_admin: ${email}`);
  } else {
    await pool.query(
      `INSERT INTO users (email, password_hash, role, linked_id) VALUES ($1, $2, 'super_admin', NULL)`,
      [email, password_hash]
    );
    console.log(`Created super_admin: ${email}`);
  }

  console.log(`Login with:\n  email:    ${email}\n  password: ${password}`);
  await pool.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
