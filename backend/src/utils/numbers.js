export function toNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function parseExcelDate(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'number') {
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    return date.toISOString().slice(0, 10);
  }
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return null;
}

export function normalizeText(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

export function lakhsToRupees(lakhs) {
  return toNumber(lakhs) * 100000;
}

export function croresToRupees(crores) {
  return toNumber(crores) * 10000000;
}

export function expenditureFromRow(row) {
  const debit = toNumber(row.debit_payment);
  const total = toNumber(row.total_amount);
  if (debit > 0) return debit;
  if (total > 0) return total;
  const lakhs = toNumber(row.in_lakhs);
  if (lakhs > 0) return lakhsToRupees(lakhs);
  return croresToRupees(row.in_crores);
}
