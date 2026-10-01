import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { importExcelWorkbook } from '../services/excelImportService.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultFile = path.join(
  __dirname,
  '../../../excel/VOUCHER FILE 2026-27.xlsx',
);

const filePath = process.argv[2] || defaultFile;
const importVouchers = process.argv.includes('--vouchers');

importExcelWorkbook({
  filePath,
  fileName: path.basename(filePath),
  importVouchers,
})
  .then((result) => {
    console.log('Import finished:', result);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
