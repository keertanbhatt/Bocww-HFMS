import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { query } from './pool.js';

dotenv.config();

export async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@bocw.gujarat.gov.in';
  const password = process.env.ADMIN_PASSWORD || 'Admin@HFMS2026';
  const name = process.env.ADMIN_NAME || 'System Administrator';

  const roleResult = await query(`SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1`);
  const roleId = roleResult.rows[0]?.id;
  if (!roleId) throw new Error('ADMIN role not found. Run migrations first.');

  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  const hash = await bcrypt.hash(password, 12);

  if (existing.rows.length) {
    await query(
      `UPDATE users SET password_hash = $1, name = $2, role_id = $3, is_active = TRUE, updated_at = NOW() WHERE email = $4`,
      [hash, name, roleId, email],
    );
    console.log(`Admin user updated: ${email}`);
  } else {
    await query(
      `INSERT INTO users (name, email, password_hash, role_id) VALUES ($1, $2, $3, $4)`,
      [name, email, hash, roleId],
    );
    console.log(`Admin user created: ${email}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
