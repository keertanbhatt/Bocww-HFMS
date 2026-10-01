import { Router } from 'express';
import { login } from '../controllers/authController.js';
import { validateBody, loginSchema } from '../validators/authValidator.js';
import {
  getAnalytics,
  getCharts,
  getSchemesDashboard,
  getScheme,
  getSchemes,
  getSummary,
  importFinancialExcel,
} from '../controllers/financialController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const authRouter = Router();
authRouter.post('/login', validateBody(loginSchema), login);

const dashboardRouter = Router();
dashboardRouter.use(authenticate, authorizeRoles('ADMIN', 'ACCOUNTANT'));
dashboardRouter.get('/summary', getSummary);
dashboardRouter.get('/schemes', getSchemesDashboard);
dashboardRouter.get('/analytics', getAnalytics);
dashboardRouter.get('/charts', getCharts);

const schemesRouter = Router();
schemesRouter.use(authenticate, authorizeRoles('ADMIN', 'ACCOUNTANT'));
schemesRouter.get('/', getSchemes);
schemesRouter.get('/:id', getScheme);

const financialRouter = Router();
financialRouter.use(authenticate, authorizeRoles('ADMIN'));
financialRouter.post('/import', upload.single('file'), importFinancialExcel);

export { authRouter, dashboardRouter, schemesRouter, financialRouter };
