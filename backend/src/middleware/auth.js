import { verifyToken } from '../utils/jwt.js';
import { query } from '../db/pool.js';

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const payload = verifyToken(token);
    const result = await query(
      `SELECT u.id, u.email, u.is_active, r.name AS role_name
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1`,
      [payload.sub],
    );
    const user = result.rows[0];
    if (!user?.is_active) {
      return res.status(401).json({ message: 'Invalid or inactive user' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role_name,
    };
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    return next();
  };
}
