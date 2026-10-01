import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { query } from './pool.js';
import { buildWorkbookCatalog } from '../services/workbookSheetCatalog.js';
import XLSX from 'xlsx';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultFile = path.join(__dirname, '../../../excel/VOUCHER FILE 2026-27.xlsx');
const filePath = process.argv[2] || defaultFile;

const workbook = XLSX.readFile(filePath, { cellDates: true });
const catalog = buildWorkbookCatalog(workbook, {});

const latest = await query(
  `SELECT id FROM excel_imports ORDER BY id DESC LIMIT 1`,
);
const importId = latest.rows[0]?.id;

if (importId) {
  await query(`UPDATE excel_imports SET sheets_catalog = $1 WHERE id = $2`, [
    JSON.stringify(catalog),
    importId,
  ]);
  console.log('Updated sheets_catalog on import id', importId);
} else {
  console.log('No excel_imports row; catalog:', catalog.sheets.map((s) => [s.name, s.workbookRows]));
}

process.exit(0);
