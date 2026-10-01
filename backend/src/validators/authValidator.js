import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export function validateBody(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: parsed.error.flatten(),
      });
    }
    req.validated = parsed.data;
    return next();
  };
}
