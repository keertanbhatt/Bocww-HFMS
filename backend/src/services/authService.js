import bcrypt from 'bcrypt';
import { query } from '../db/pool.js';
import { signToken } from '../utils/jwt.js';

export async function loginUser(email, password) {
  const result = await query(
    `SELECT u.id, u.name, u.email, u.password_hash, u.is_active, r.name AS role_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.email = $1`,
    [email.toLowerCase().trim()],
  );

  const user = result.rows[0];
  if (!user || !user.is_active) {
    return null;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;

  const token = signToken(user);
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role_name,
    },
  };
}
