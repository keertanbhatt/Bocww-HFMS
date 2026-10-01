import XLSX from 'xlsx';
import { query } from '../db/pool.js';
import { buildWorkbookCatalog } from './workbookSheetCatalog.js';
import {
  croresToRupees,
  lakhsToRupees,
  normalizeText,
  parseExcelDate,
  toNumber,
} from '../utils/numbers.js';

const VOUCHER_HEADERS = [
  'voucher_no',
  'order_number',
  'transaction_date',
  'details',
  'beneficiary_count',
  'sub_head_text',
  'scheme_name_text',
  'tds_base',
  'tds_amount',
  'cgst_amount',
  'sgst_amount',
  'igst_amount',
  'security_deposit',
  'labor_cess',
  'lab_testing',
  'withhold_amount',
  'debit_payment',
  'total_amount',
  'credit_amount',
  'money_transfer',
  'voucher_created_date',
  'cheque_no',
  'month_num',
  'payment_date',
  'in_lakhs',
  'in_crores',
];

const FY_SHEET_MAP = {
  Main: { name: '2026-2027', label: '2026-27', isActive: true },
  Sheet6: { name: '2026-2027', label: '2026-27', isActive: true },
  '2025-2026': { name: '2025-2026', label: '2025-26', isActive: false },
};

async function upsertFinancialYear(client, { name, label, isActive }) {
  if (isActive) {
    await client.query(`UPDATE financial_years SET is_active = FALSE`);
  }
  const result = await client.query(
    `INSERT INTO financial_years (name, label, is_active)
     VALUES ($1, $2, $3)
     ON CONFLICT (name) DO UPDATE SET label = EXCLUDED.label, is_active = EXCLUDED.is_active
     RETURNING id`,
    [name, label, isActive],
  );
  return result.rows[0].id;
}

function createIdCache(getOrCreateFn) {
  const cache = new Map();
  return async (client, rawName) => {
    const name = normalizeText(rawName);
    if (!name || name === '(blank)') return null;
    if (cache.has(name)) return cache.get(name);
    const id = await getOrCreateFn(client, name);
    cache.set(name, id);
    return id;
  };
}

async function insertScheme(client, name) {
  const result = await client.query(
    `INSERT INTO schemes (name) VALUES ($1)
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [name],
  );
  return result.rows[0].id;
}

async function insertSubHead(client, name) {
  const result = await client.query(
    `INSERT INTO sub_heads (name) VALUES ($1)
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [name],
  );
  return result.rows[0].id;
}

const getOrCreateScheme = createIdCache(insertScheme);
const getOrCreateSubHead = createIdCache(insertSubHead);

function mapVoucherRow(rowArray) {
  const mapped = {};
  VOUCHER_HEADERS.forEach((key, index) => {
    mapped[key] = rowArray[index] ?? null;
  });
  return mapped;
}

function isVoucherHeaderRow(row) {
  return normalizeText(row[0]) === 'વાઉચર નં.';
}

export async function importExcelWorkbook({
  filePath,
  fileName,
  importedBy = null,
  importVouchers = false,
  importSummaries = true,
  importBankSnapshots = true,
}) {
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const importRecord = await query(
    `INSERT INTO excel_imports (file_name, imported_by, status) VALUES ($1, $2, 'processing') RETURNING id`,
    [fileName, importedBy],
  );
  const importId = importRecord.rows[0].id;

  let processed = 0;
  let failed = 0;
  const sheetImportStats = {};

  const client = await (await import('../db/pool.js')).pool.connect();

  try {
    await client.query('BEGIN');

    const fyIds = {};
    for (const [sheetName, fyMeta] of Object.entries(FY_SHEET_MAP)) {
      if (workbook.SheetNames.includes(sheetName)) {
        fyIds[sheetName] = await upsertFinancialYear(client, fyMeta);
      }
    }

    if (importSummaries && workbook.SheetNames.includes('Sheet1')) {
      const sheet = workbook.Sheets.Sheet1;
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      const fyId = fyIds.Main || (await upsertFinancialYear(client, FY_SHEET_MAP.Main));
      let sheet1Imported = 0;

      for (let i = 4; i < rows.length; i += 1) {
        const row = rows[i];
        const schemeLabel = normalizeText(row[0]);
        if (!schemeLabel || schemeLabel === 'Grand Total') continue;

        try {
          const schemeId = await getOrCreateScheme(client, schemeLabel);
          if (!schemeId) continue;

          const inLakhs = toNumber(row[1]);
          const inCrores = toNumber(row[2]);
          const expenditure =
            inLakhs > 0 ? lakhsToRupees(inLakhs) : croresToRupees(inCrores);

          await client.query(
            `INSERT INTO scheme_expenditure_summaries
              (scheme_id, financial_year_id, expenditure_amount, in_lakhs, in_crores,
               tds_amount, cgst_amount, sgst_amount, igst_amount, source_sheet)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'Sheet1')
             ON CONFLICT (scheme_id, financial_year_id, source_sheet)
             DO UPDATE SET
               expenditure_amount = EXCLUDED.expenditure_amount,
               in_lakhs = EXCLUDED.in_lakhs,
               in_crores = EXCLUDED.in_crores,
               tds_amount = EXCLUDED.tds_amount,
               cgst_amount = EXCLUDED.cgst_amount,
               sgst_amount = EXCLUDED.sgst_amount,
               igst_amount = EXCLUDED.igst_amount,
               updated_at = NOW()`,
            [
              schemeId,
              fyId,
              expenditure,
              inLakhs,
              inCrores,
              toNumber(row[3]),
              toNumber(row[4]),
              toNumber(row[5]),
              toNumber(row[6]),
            ],
          );
          processed += 1;
          sheet1Imported += 1;
        } catch (err) {
          failed += 1;
          await query(
            `INSERT INTO excel_import_errors (import_id, sheet_name, row_number, error_message, raw_data)
             VALUES ($1, 'Sheet1', $2, $3, $4)`,
            [importId, i + 1, err.message, JSON.stringify(row)],
          );
        }
      }
      sheetImportStats.Sheet1 = {
        recordsImported: sheet1Imported,
        note: `${sheet1Imported} scheme summary rows loaded into scheme_expenditure_summaries`,
      };
    }

    if (importBankSnapshots && workbook.SheetNames.includes('bank balance + gsfs')) {
      const sheet = workbook.Sheets['bank balance + gsfs'];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      let snapshotDate = null;

      await client.query(`DELETE FROM bank_balance_snapshots WHERE source_sheet = $1`, [
        'bank balance + gsfs',
      ]);
      let bankImported = 0;

      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        const dateCell = normalizeText(row[2]);
        if (dateCell?.startsWith('DATE :')) {
          const parts = dateCell.replace('DATE :', '').trim().split('/');
          if (parts.length === 3) {
            snapshotDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
        }

        const bank = normalizeText(row[0]);
        const account = normalizeText(row[1]);
        const amount = row[2];

        if (bank === 'BANK' || !bank) continue;

        if (['Total Bank Bal.', 'GSFS OWN DUND', 'PD.PLA', 'TOTAL'].includes(bank)) {
          await client.query(
            `INSERT INTO bank_balance_snapshots (snapshot_date, bank_name, account_number, balance_crores, row_type, source_sheet)
             VALUES ($1, $2, NULL, $3, $4, 'bank balance + gsfs')`,
            [snapshotDate, bank, toNumber(amount), 'summary'],
          );
          processed += 1;
          bankImported += 1;
          continue;
        }

        if (account && typeof amount === 'number') {
          await client.query(
            `INSERT INTO bank_balance_snapshots (snapshot_date, bank_name, account_number, balance_crores, row_type, source_sheet)
             VALUES ($1, $2, $3, $4, 'bank', 'bank balance + gsfs')`,
            [snapshotDate, bank, account, toNumber(amount)],
          );
          processed += 1;
          bankImported += 1;
        }
      }
      sheetImportStats['bank balance + gsfs'] = {
        recordsImported: bankImported,
        note: `${bankImported} bank / summary rows in bank_balance_snapshots`,
      };
    }

    if (importVouchers) {
      for (const sheetName of ['Main', '2025-2026']) {
        if (!workbook.SheetNames.includes(sheetName)) continue;
        const fyId = fyIds[sheetName];
        if (!fyId) continue;

        await client.query(
          `DELETE FROM voucher_transactions WHERE financial_year_id = $1 AND source_sheet = $2`,
          [fyId, sheetName],
        );

        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', blankrows: false });

        const batch = [];
        const BATCH_SIZE = 500;
        let sheetVoucherCount = 0;

        for (let i = 1; i < rows.length; i += 1) {
          const raw = rows[i];
          if (!raw?.length || isVoucherHeaderRow(raw)) continue;

          try {
            const row = mapVoucherRow(raw);
            const schemeId = await getOrCreateScheme(client, row.scheme_name_text);
            const subHeadId = await getOrCreateSubHead(client, row.sub_head_text);

            batch.push([
              fyId,
              normalizeText(row.voucher_no),
              normalizeText(row.order_number),
              parseExcelDate(row.transaction_date),
              normalizeText(row.details),
              row.beneficiary_count ? toNumber(row.beneficiary_count) : null,
              subHeadId,
              schemeId,
              normalizeText(row.sub_head_text),
              normalizeText(row.scheme_name_text),
              toNumber(row.tds_base),
              toNumber(row.tds_amount),
              toNumber(row.cgst_amount),
              toNumber(row.sgst_amount),
              toNumber(row.igst_amount),
              toNumber(row.security_deposit),
              toNumber(row.labor_cess),
              toNumber(row.lab_testing),
              toNumber(row.withhold_amount),
              toNumber(row.debit_payment),
              toNumber(row.total_amount),
              toNumber(row.credit_amount),
              toNumber(row.money_transfer),
              parseExcelDate(row.voucher_created_date),
              normalizeText(row.cheque_no),
              row.month_num ? toNumber(row.month_num) : null,
              parseExcelDate(row.payment_date),
              toNumber(row.in_lakhs),
              toNumber(row.in_crores),
              sheetName,
            ]);

            if (batch.length >= BATCH_SIZE) {
              await insertVoucherBatch(client, batch);
              processed += batch.length;
              sheetVoucherCount += batch.length;
              batch.length = 0;
            }
          } catch (err) {
            failed += 1;
            if (failed <= 200) {
              await query(
                `INSERT INTO excel_import_errors (import_id, sheet_name, row_number, error_message, raw_data)
                 VALUES ($1, $2, $3, $4, $5)`,
                [importId, sheetName, i + 1, err.message, JSON.stringify(raw)],
              );
            }
          }
        }

        if (batch.length) {
          await insertVoucherBatch(client, batch);
          processed += batch.length;
          sheetVoucherCount += batch.length;
        }

        sheetImportStats[sheetName] = {
          recordsImported: sheetVoucherCount,
          note: `${sheetVoucherCount.toLocaleString('en-IN')} voucher rows in voucher_transactions`,
        };
      }
    } else {
      for (const sheetName of ['Main', 'Sheet6', '2025-2026']) {
        if (!workbook.SheetNames.includes(sheetName)) continue;
        sheetImportStats[sheetName] = {
          recordsImported: 0,
          note:
            sheetName === 'Sheet6'
              ? 'Mirror of Main — skipped (enable voucher import on Main only)'
              : 'Voucher rows not imported (use importVouchers=true or --vouchers)',
        };
      }
    }

    if (workbook.SheetNames.includes('Sheet6')) {
      sheetImportStats.Sheet6 = sheetImportStats.Sheet6 || {
        recordsImported: 0,
        note: 'Duplicate of Main tab — not loaded to avoid double-counting',
      };
    }

    const sheetsCatalog = buildWorkbookCatalog(workbook, sheetImportStats);

    await client.query('COMMIT');
    await query(
      `UPDATE excel_imports
       SET status = 'completed', records_processed = $1, records_failed = $2, sheets_catalog = $4
       WHERE id = $3`,
      [processed, failed, importId, JSON.stringify(sheetsCatalog)],
    );

    return { importId, processed, failed };
  } catch (error) {
    await client.query('ROLLBACK');
    await query(
      `UPDATE excel_imports SET status = 'failed', records_failed = records_failed + 1 WHERE id = $1`,
      [importId],
    );
    await query(
      `INSERT INTO excel_import_errors (import_id, sheet_name, error_message)
       VALUES ($1, NULL, $2)`,
      [importId, error.message],
    );
    throw error;
  } finally {
    client.release();
  }
}

async function insertVoucherBatch(client, batch) {
  const values = [];
  const params = [];
  let paramIndex = 1;

  batch.forEach((row) => {
    const placeholders = row.map(() => `$${paramIndex++}`).join(', ');
    values.push(`(${placeholders})`);
    params.push(...row);
  });

  await client.query(
    `INSERT INTO voucher_transactions (
      financial_year_id, voucher_no, order_number, transaction_date, details,
      beneficiary_count, sub_head_id, scheme_id, sub_head_text, scheme_name_text,
      tds_base, tds_amount, cgst_amount, sgst_amount, igst_amount,
      security_deposit, labor_cess, lab_testing, withhold_amount,
      debit_payment, total_amount, credit_amount, money_transfer,
      voucher_created_date, cheque_no, month_num, payment_date,
      in_lakhs, in_crores, source_sheet
    ) VALUES ${values.join(', ')}`,
    params,
  );
}
