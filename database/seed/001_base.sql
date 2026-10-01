-- Seed data from Sheet1 pivot (VOUCHER FILE 2026-27.xlsx)
UPDATE financial_years SET is_active = FALSE;
INSERT INTO financial_years (name, label, is_active) VALUES
  ('2026-2027', '2026-27', TRUE),
  ('2025-2026', '2025-26', FALSE)
ON CONFLICT (name) DO UPDATE SET label = EXCLUDED.label, is_active = EXCLUDED.is_active;

INSERT INTO users (name, email, password_hash, role_id)
SELECT 'System Administrator', 'admin@bocw.gujarat.gov.in',
  '$2b$12$PmtrmHKpvDAIfufi1HFyaevfPhwjUrFnu81qwJwyCExqJLL02LXW.', id
FROM roles WHERE name = 'ADMIN'
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role_id = EXCLUDED.role_id,
  is_active = TRUE,
  updated_at = NOW();
