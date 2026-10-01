import jwt from 'jsonwebtoken';

export function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role_name,
    },
    secret,
    { expiresIn: '8h' },
  );
}

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return jwt.verify(token, secret);
}
