import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import {
  authRouter,
  dashboardRouter,
  financialRouter,
  schemesRouter,
} from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'HFMS API' });
});

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/schemes', schemesRouter);
app.use('/api/financial', financialRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`HFMS backend running on http://localhost:${PORT}`);
});
