import XLSX from 'xlsx';
import { normalizeText } from '../utils/numbers.js';

/** Known sheets in VOUCHER FILE 2026-27.xlsx (order matches workbook tabs). */
export const KNOWN_WORKBOOK_SHEETS = [
  '2025-2026',
  'Sheet1',
  'Main',
  'bank balance + gsfs',
  'Sheet6',
];

const SHEET_META = {
  '2025-2026': {
    type: 'voucher_detail',
    title: 'Prior year vouchers',
    description:
      'Transaction-level voucher rows for financial year 2025–26 (Gujarati column headers).',
    financialYearKey: '2025-2026',
    importKey: 'vouchers',
  },
  Sheet1: {
    type: 'scheme_summary',
    title: 'Scheme expenditure pivot',
    description:
      'Pivot summary by welfare scheme: in lakhs/crores, TDS, CGST, SGST, IGST — drives dashboard totals.',
    financialYearKey: '2026-2027',
    importKey: 'summaries',
  },
  Main: {
    type: 'voucher_detail',
    title: 'Current year vouchers (Main)',
    description:
      'Primary voucher register for FY 2026–27 (~1M rows). Import with vouchers enabled for drill-down.',
    financialYearKey: '2026-2027',
    importKey: 'vouchers',
  },
  'bank balance + gsfs': {
    type: 'bank_balances',
    title: 'Bank & GSFS balances',
    description:
      'Bank accounts, GSFS, PD.PLA and total rows with balances in crores and snapshot date.',
    importKey: 'bank',
  },
  Sheet6: {
    type: 'voucher_mirror',
    title: 'Voucher mirror (Sheet6)',
    description:
      'Same structure and row count as Main — treated as a workbook copy; not imported separately to avoid duplicate transactions.',
    financialYearKey: '2026-2027',
    importKey: 'none',
  },
};

function sheetDimensions(sheet) {
  const ref = sheet?.['!ref'];
  if (!ref) return { rows: 0, cols: 0 };
  const range = XLSX.utils.decode_range(ref);
  return {
    rows: range.e.r - range.s.r + 1,
    cols: range.e.c - range.s.c + 1,
  };
}

function headerPreview(sheet, maxCols = 8) {
  const headers = [];
  for (let c = 0; c < maxCols; c += 1) {
    const cell = sheet[XLSX.utils.encode_cell({ r: 0, c })];
    const value = normalizeText(cell?.v ?? cell?.w);
    if (value) headers.push(value);
  }
  if (headers.length) return headers;

  for (let r = 0; r < 6; r += 1) {
    const row = [];
    for (let c = 0; c < maxCols; c += 1) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      row.push(normalizeText(cell?.v ?? cell?.w));
    }
    if (row.some(Boolean)) return row.filter(Boolean);
  }
  return [];
}

function countSheet1Schemes(sheet) {
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  let count = 0;
  for (let i = 4; i < rows.length; i += 1) {
    const label = normalizeText(rows[i]?.[0]);
    if (label && label !== 'Grand Total') count += 1;
  }
  return count;
}

/**
 * Build catalog entries for every tab in the workbook (called during import).
 */
export function buildWorkbookCatalog(workbook, importStats = {}) {
  const names = workbook.SheetNames || [];
  const entries = names.map((name) => {
    const sheet = workbook.Sheets[name];
    const meta = SHEET_META[name] || {
      type: 'unknown',
      title: name,
      description: 'Worksheet present in the uploaded file.',
      importKey: 'none',
    };
    const { rows, cols } = sheetDimensions(sheet);
    const headers = headerPreview(sheet);

    const entry = {
      name,
      type: meta.type,
      title: meta.title,
      description: meta.description,
      financialYearKey: meta.financialYearKey || null,
      importKey: meta.importKey,
      workbookRows: rows,
      workbookCols: cols,
      columnHeaders: headers,
    };

    if (name === 'Sheet1') {
      entry.schemeRowsInWorkbook = countSheet1Schemes(sheet);
    }

    const statKey = importStats[name];
    if (statKey) {
      entry.recordsImported = statKey.recordsImported;
      entry.importNote = statKey.note;
    }

    return entry;
  });

  const missing = KNOWN_WORKBOOK_SHEETS.filter((n) => !names.includes(n));
  missing.forEach((name) => {
    const meta = SHEET_META[name];
    entries.push({
      name,
      type: meta?.type || 'missing',
      title: meta?.title || name,
      description: 'Not found in the last uploaded workbook.',
      workbookRows: 0,
      workbookCols: 0,
      columnHeaders: [],
      missingFromWorkbook: true,
    });
  });

  return {
    sheetNames: names,
    sheets: entries.sort((a, b) => {
      const ia = KNOWN_WORKBOOK_SHEETS.indexOf(a.name);
      const ib = KNOWN_WORKBOOK_SHEETS.indexOf(b.name);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    }),
  };
}

export function buildCatalogFromFilePath(filePath) {
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  return buildWorkbookCatalog(workbook, {});
}

export function sheetMetaForName(name) {
  return (
    SHEET_META[name] || {
      type: 'unknown',
      title: name,
      description: 'Worksheet',
      importKey: 'none',
    }
  );
}
