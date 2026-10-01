-- HFMS BOCW Gujarat - initial schema (aligned to VOUCHER FILE 2026-27.xlsx)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (name) VALUES ('ADMIN'), ('ACCOUNTANT')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_years (
  id SERIAL PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE,
  label VARCHAR(50) NOT NULL,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schemes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  code VARCHAR(100),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS sub_heads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(500) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scheme_budgets (
  id SERIAL PRIMARY KEY,
  scheme_id INTEGER NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  financial_year_id INTEGER NOT NULL REFERENCES financial_years(id) ON DELETE CASCADE,
  budget_amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (scheme_id, financial_year_id)
);

CREATE TABLE IF NOT EXISTS scheme_expenditure_summaries (
  id SERIAL PRIMARY KEY,
  scheme_id INTEGER NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  financial_year_id INTEGER NOT NULL REFERENCES financial_years(id) ON DELETE CASCADE,
  expenditure_amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
  in_lakhs NUMERIC(18, 6),
  in_crores NUMERIC(18, 8),
  tds_amount NUMERIC(18, 2) DEFAULT 0,
  cgst_amount NUMERIC(18, 2) DEFAULT 0,
  sgst_amount NUMERIC(18, 2) DEFAULT 0,
  igst_amount NUMERIC(18, 2) DEFAULT 0,
  source_sheet VARCHAR(100) NOT NULL DEFAULT 'Sheet1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (scheme_id, financial_year_id, source_sheet)
);

CREATE TABLE IF NOT EXISTS voucher_transactions (
  id BIGSERIAL PRIMARY KEY,
  financial_year_id INTEGER NOT NULL REFERENCES financial_years(id) ON DELETE CASCADE,
  voucher_no VARCHAR(50),
  order_number VARCHAR(100),
  transaction_date DATE,
  details TEXT,
  beneficiary_count INTEGER,
  sub_head_id INTEGER REFERENCES sub_heads(id),
  scheme_id INTEGER REFERENCES schemes(id),
  sub_head_text VARCHAR(500),
  scheme_name_text VARCHAR(500),
  tds_base NUMERIC(18, 2) DEFAULT 0,
  tds_amount NUMERIC(18, 2) DEFAULT 0,
  cgst_amount NUMERIC(18, 2) DEFAULT 0,
  sgst_amount NUMERIC(18, 2) DEFAULT 0,
  igst_amount NUMERIC(18, 2) DEFAULT 0,
  security_deposit NUMERIC(18, 2) DEFAULT 0,
  labor_cess NUMERIC(18, 2) DEFAULT 0,
  lab_testing NUMERIC(18, 2) DEFAULT 0,
  withhold_amount NUMERIC(18, 2) DEFAULT 0,
  debit_payment NUMERIC(18, 2) DEFAULT 0,
  total_amount NUMERIC(18, 2) DEFAULT 0,
  credit_amount NUMERIC(18, 2) DEFAULT 0,
  money_transfer NUMERIC(18, 2) DEFAULT 0,
  voucher_created_date DATE,
  cheque_no VARCHAR(100),
  month_num INTEGER,
  payment_date DATE,
  in_lakhs NUMERIC(18, 8),
  in_crores NUMERIC(18, 10),
  source_sheet VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voucher_fy_scheme ON voucher_transactions (financial_year_id, scheme_id);
CREATE INDEX IF NOT EXISTS idx_voucher_fy_date ON voucher_transactions (financial_year_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_scheme_expenditure_fy ON scheme_expenditure_summaries (financial_year_id);

CREATE TABLE IF NOT EXISTS excel_imports (
  id SERIAL PRIMARY KEY,
  file_name VARCHAR(500) NOT NULL,
  imported_by INTEGER REFERENCES users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  records_processed INTEGER NOT NULL DEFAULT 0,
  records_failed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS excel_import_errors (
  id SERIAL PRIMARY KEY,
  import_id INTEGER NOT NULL REFERENCES excel_imports(id) ON DELETE CASCADE,
  sheet_name VARCHAR(100),
  row_number INTEGER,
  error_message TEXT NOT NULL,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_balance_snapshots (
  id SERIAL PRIMARY KEY,
  snapshot_date DATE,
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  balance_crores NUMERIC(18, 6),
  row_type VARCHAR(50),
  source_sheet VARCHAR(100) NOT NULL DEFAULT 'bank balance + gsfs',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
