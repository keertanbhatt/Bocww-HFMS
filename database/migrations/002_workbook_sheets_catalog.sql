ALTER TABLE excel_imports
  ADD COLUMN IF NOT EXISTS sheets_catalog JSONB;
