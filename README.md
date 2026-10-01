# HFMS — Gujarat BOCW Welfare Board

Human & Financial Management System for the **Gujarat Building & Other Construction Workers' Welfare Board**.

## Stack

- **Frontend:** React, JavaScript, Tailwind CSS, Recharts
- **Backend:** Node.js, Express, JWT, bcrypt
- **Database:** Neon PostgreSQL

## Project structure

```text
hfms/
├── frontend/
├── backend/
├── database/migrations/
├── database/seed/
└── excel/
```

## Excel data model (VOUCHER FILE 2026-27.xlsx)

| Sheet | Purpose |
| --- | --- |
| `2025-2026` | Prior-year voucher transactions (~1M rows) |
| `Sheet1` | Pivot summary by scheme (`Sum of IN LAKHS`) — dashboard totals |
| `Main` | Current-year voucher transactions (~1M rows) |
| `bank balance + gsfs` | Bank / GSFS / PD.PLA balance snapshots |
| `Sheet6` | Mirror of `Main` (same row count; not imported to avoid duplicates) |

The workbook does **not** include sanctioned budget columns. Dashboard expenditure is loaded from **Sheet1**; budget/utilization cards appear only after budget rows are added to `scheme_budgets`.

## Setup

### 1. Backend environment

Copy `backend/.env.example` to `backend/.env` and set:

```env
PORT=5000
DATABASE_URL=your_neon_pooler_url
JWT_SECRET=strong_random_secret
ADMIN_EMAIL=admin@bocw.gujarat.gov.in
ADMIN_PASSWORD=choose_a_secure_password
FRONTEND_ORIGIN=http://localhost:5173
```

### 2. Frontend environment

Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Install & database

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
npm run migrate
npm run seed:admin
npm run import:excel
```

Optional full voucher import (large file, slow):

```bash
npm run import:excel -- --vouchers
```

### 4. Run

```bash
npm run dev
```

- Frontend: http://localhost:5173  
- API: http://localhost:5000/api  

Default admin (change after first login):

- Email: `admin@bocw.gujarat.gov.in`
- Password: value of `ADMIN_PASSWORD` in `backend/.env`

## API endpoints

- `POST /api/auth/login`
- `GET /api/dashboard/summary`
- `GET /api/dashboard/schemes`
- `GET /api/dashboard/charts`
- `GET /api/schemes`
- `GET /api/schemes/:id`
- `POST /api/financial/import` (multipart `file`, optional `importVouchers=true`)

## Re-import Excel

Use the API (admin JWT) or CLI:

```bash
npm run import:excel -- "/path/to/VOUCHER FILE 2026-27.xlsx"
```

## Security notes

- Never commit `.env` files (already gitignored).
- Rotate Neon credentials if they were shared in chat or tickets.
- Use Neon IP allow lists in production if required.
