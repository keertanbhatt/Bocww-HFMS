import { loginUser } from '../services/authService.js';

export async function login(req, res) {
  try {
    const { email, password } = req.validated;
    const result = await loginUser(email, password);
    if (!result) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Login failed' });
  }
}
