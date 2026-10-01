import { query } from '../db/pool.js';

export async function listFinancialYears() {
  const result = await query(
    `SELECT id, name, label, is_active FROM financial_years ORDER BY name DESC`,
  );
  return result.rows;
}

export async function resolveFinancialYearId(financialYearId) {
  if (financialYearId) {
    const result = await query(`SELECT id, name, label FROM financial_years WHERE id = $1`, [
      financialYearId,
    ]);
    return result.rows[0] || null;
  }
  const active = await query(
    `SELECT id, name, label FROM financial_years WHERE is_active = TRUE ORDER BY id DESC LIMIT 1`,
  );
  if (active.rows[0]) return active.rows[0];
  const latest = await query(`SELECT id, name, label FROM financial_years ORDER BY id DESC LIMIT 1`);
  return latest.rows[0] || null;
}

export async function getDashboardSummary(financialYearId) {
  const fy = await resolveFinancialYearId(financialYearId);
  if (!fy) {
    return {
      financialYear: null,
      hasBudgetData: false,
      totalBudget: 0,
      totalExpenditure: 0,
      remainingBudget: 0,
      utilizationPercent: 0,
      schemeCount: 0,
    };
  }

  const result = await query(
    `SELECT
       COUNT(DISTINCT s.id) AS scheme_count,
       COALESCE(SUM(ses.expenditure_amount), 0) AS total_expenditure,
       COALESCE(SUM(sb.budget_amount), 0) AS total_budget,
       COUNT(sb.id) FILTER (WHERE sb.budget_amount > 0) AS budget_rows
     FROM schemes s
     LEFT JOIN scheme_expenditure_summaries ses
       ON ses.scheme_id = s.id AND ses.financial_year_id = $1
     LEFT JOIN scheme_budgets sb
       ON sb.scheme_id = s.id AND sb.financial_year_id = $1
     WHERE ses.id IS NOT NULL OR sb.id IS NOT NULL`,
    [fy.id],
  );

  const row = result.rows[0];
  const totalExpenditure = Number(row.total_expenditure || 0);
  const totalBudget = Number(row.total_budget || 0);
  const hasBudgetData = Number(row.budget_rows || 0) > 0;
  const remainingBudget = hasBudgetData ? totalBudget - totalExpenditure : 0;
  const utilizationPercent =
    hasBudgetData && totalBudget > 0 ? (totalExpenditure / totalBudget) * 100 : 0;

  return {
    financialYear: fy,
    hasBudgetData,
    totalBudget,
    totalExpenditure,
    remainingBudget,
    utilizationPercent,
    schemeCount: Number(row.scheme_count || 0),
  };
}

export async function getSchemeBreakdown(financialYearId, search = '') {
  const fy = await resolveFinancialYearId(financialYearId);
  if (!fy) return { financialYear: null, schemes: [] };

  const params = [fy.id];
  let searchClause = '';
  if (search.trim()) {
    params.push(`%${search.trim()}%`);
    searchClause = `AND (s.name ILIKE $2 OR COALESCE(s.code, '') ILIKE $2)`;
  }

  const result = await query(
    `SELECT
       s.id,
       s.name,
       s.code,
       COALESCE(sb.budget_amount, 0) AS budget_amount,
       COALESCE(ses.expenditure_amount, 0) AS expenditure_amount,
       COALESCE(ses.in_lakhs, 0) AS in_lakhs,
       COALESCE(ses.in_crores, 0) AS in_crores,
       COALESCE(ses.tds_amount, 0) AS tds_amount,
       COALESCE(ses.cgst_amount, 0) AS cgst_amount,
       COALESCE(ses.sgst_amount, 0) AS sgst_amount,
       COALESCE(ses.igst_amount, 0) AS igst_amount
     FROM schemes s
     LEFT JOIN scheme_expenditure_summaries ses
       ON ses.scheme_id = s.id AND ses.financial_year_id = $1
     LEFT JOIN scheme_budgets sb
       ON sb.scheme_id = s.id AND sb.financial_year_id = $1
     WHERE ses.id IS NOT NULL ${searchClause}
     ORDER BY ses.expenditure_amount DESC NULLS LAST, s.name ASC`,
    params,
  );

  const hasBudgetData = result.rows.some((r) => Number(r.budget_amount) > 0);

  const schemes = result.rows.map((row) => {
    const budget = Number(row.budget_amount || 0);
    const expenditure = Number(row.expenditure_amount || 0);
    const remaining = budget > 0 ? budget - expenditure : null;
    const utilization = budget > 0 ? (expenditure / budget) * 100 : null;

    return {
      id: row.id,
      name: row.name,
      code: row.code,
      budgetAmount: budget,
      expenditureAmount: expenditure,
      remainingBudget: remaining,
      utilizationPercent: utilization,
      inLakhs: Number(row.in_lakhs || 0),
      inCrores: Number(row.in_crores || 0),
      tdsAmount: Number(row.tds_amount || 0),
      cgstAmount: Number(row.cgst_amount || 0),
      sgstAmount: Number(row.sgst_amount || 0),
      igstAmount: Number(row.igst_amount || 0),
      totalTaxAmount:
        Number(row.tds_amount || 0) +
        Number(row.cgst_amount || 0) +
        Number(row.sgst_amount || 0) +
        Number(row.igst_amount || 0),
    };
  });

  return { financialYear: fy, hasBudgetData, schemes };
}

export async function getChartData(financialYearId) {
  const breakdown = await getSchemeBreakdown(financialYearId);
  const topSchemes = breakdown.schemes.slice(0, 12);

  return {
    financialYear: breakdown.financialYear,
    hasBudgetData: breakdown.hasBudgetData,
    budgetVsExpenditure: topSchemes.map((s) => ({
      scheme: s.name,
      budget: s.budgetAmount,
      expenditure: s.expenditureAmount,
    })),
    expenditureShare: breakdown.schemes.map((s) => ({
      scheme: s.name,
      value: s.expenditureAmount,
    })),
    lakhsFromSheet: breakdown.schemes
      .filter((s) => s.inLakhs > 0)
      .slice(0, 10)
      .map((s) => ({
        scheme: s.name,
        inLakhs: s.inLakhs,
        expenditure: s.expenditureAmount,
      })),
    taxComponents: buildTaxComponents(breakdown.schemes),
  };
}

function buildTaxComponents(schemes) {
  const totals = schemes.reduce(
    (acc, s) => {
      acc.tds += s.tdsAmount || 0;
      acc.cgst += s.cgstAmount || 0;
      acc.sgst += s.sgstAmount || 0;
      acc.igst += s.igstAmount || 0;
      return acc;
    },
    { tds: 0, cgst: 0, sgst: 0, igst: 0 },
  );
  return [
    { name: 'TDS', value: totals.tds },
    { name: 'CGST', value: totals.cgst },
    { name: 'SGST', value: totals.sgst },
    { name: 'IGST', value: totals.igst },
  ].filter((item) => item.value > 0);
}

export async function getDashboardAnalytics(financialYearId) {
  const fy = await resolveFinancialYearId(financialYearId);
  if (!fy) {
    return {
      financialYear: null,
      taxes: null,
      sheetTotals: null,
      tierCounts: null,
      bankBalances: [],
      vouchers: null,
      dataSource: null,
    };
  }

  const taxResult = await query(
    `SELECT
       COALESCE(SUM(tds_amount), 0) AS tds,
       COALESCE(SUM(cgst_amount), 0) AS cgst,
       COALESCE(SUM(sgst_amount), 0) AS sgst,
       COALESCE(SUM(igst_amount), 0) AS igst,
       COALESCE(SUM(in_lakhs), 0) AS total_in_lakhs,
       COALESCE(SUM(in_crores), 0) AS total_in_crores,
       COUNT(*) FILTER (WHERE expenditure_amount > 0 AND in_lakhs >= 500) AS tier_high,
       COUNT(*) FILTER (WHERE expenditure_amount > 0 AND in_lakhs >= 50 AND in_lakhs < 500) AS tier_moderate,
       COUNT(*) FILTER (WHERE expenditure_amount > 0 AND (in_lakhs < 50 OR in_lakhs IS NULL)) AS tier_normal,
       COUNT(*) FILTER (WHERE expenditure_amount <= 0) AS tier_zero,
       MAX(expenditure_amount) AS max_expenditure,
       MIN(expenditure_amount) FILTER (WHERE expenditure_amount > 0) AS min_expenditure
     FROM scheme_expenditure_summaries
     WHERE financial_year_id = $1`,
    [fy.id],
  );

  const topSchemeResult = await query(
    `SELECT s.name, ses.expenditure_amount
     FROM scheme_expenditure_summaries ses
     JOIN schemes s ON s.id = ses.scheme_id
     WHERE ses.financial_year_id = $1 AND ses.expenditure_amount > 0
     ORDER BY ses.expenditure_amount DESC
     LIMIT 1`,
    [fy.id],
  );

  const bankResult = await query(
    `SELECT bank_name, account_number, balance_crores, row_type, snapshot_date
     FROM bank_balance_snapshots
     ORDER BY balance_crores DESC NULLS LAST, id ASC
     LIMIT 12`,
  );

  const voucherResult = await query(
    `SELECT
       COUNT(*)::int AS transaction_count,
       COALESCE(SUM(debit_payment), 0) AS total_debit,
       COALESCE(SUM(total_amount), 0) AS total_amount,
       COALESCE(SUM(beneficiary_count), 0) AS total_beneficiaries,
       COALESCE(SUM(tds_amount), 0) AS voucher_tds,
       COALESCE(SUM(security_deposit), 0) AS security_deposit,
       COALESCE(SUM(labor_cess), 0) AS labor_cess,
       MIN(transaction_date) AS earliest_date,
       MAX(transaction_date) AS latest_date
     FROM voucher_transactions
     WHERE financial_year_id = $1`,
    [fy.id],
  );

  const importResult = await query(
    `SELECT file_name, status, records_processed, records_failed, created_at
     FROM excel_imports
     ORDER BY id DESC
     LIMIT 1`,
  );

  const taxRow = taxResult.rows[0] || {};
  const tds = Number(taxRow.tds || 0);
  const cgst = Number(taxRow.cgst || 0);
  const sgst = Number(taxRow.sgst || 0);
  const igst = Number(taxRow.igst || 0);
  const gstTotal = cgst + sgst + igst;
  const voucherRow = voucherResult.rows[0] || {};

  return {
    financialYear: fy,
    taxes: {
      tds,
      cgst,
      sgst,
      igst,
      gstTotal,
      combined: tds + gstTotal,
    },
    sheetTotals: {
      inLakhs: Number(taxRow.total_in_lakhs || 0),
      inCrores: Number(taxRow.total_in_crores || 0),
    },
    tierCounts: {
      high: Number(taxRow.tier_high || 0),
      moderate: Number(taxRow.tier_moderate || 0),
      normal: Number(taxRow.tier_normal || 0),
      zero: Number(taxRow.tier_zero || 0),
    },
    expenditureRange: {
      max: Number(taxRow.max_expenditure || 0),
      min: Number(taxRow.min_expenditure || 0),
      topSchemeName: topSchemeResult.rows[0]?.name || null,
      topSchemeAmount: Number(topSchemeResult.rows[0]?.expenditure_amount || 0),
    },
    bankBalances: bankResult.rows.map((row) => ({
      bankName: row.bank_name,
      accountNumber: row.account_number,
      balanceCrores: Number(row.balance_crores || 0),
      rowType: row.row_type,
      snapshotDate: row.snapshot_date,
    })),
    vouchers: {
      hasData: Number(voucherRow.transaction_count || 0) > 0,
      transactionCount: Number(voucherRow.transaction_count || 0),
      totalDebit: Number(voucherRow.total_debit || 0),
      totalAmount: Number(voucherRow.total_amount || 0),
      totalBeneficiaries: Number(voucherRow.total_beneficiaries || 0),
      voucherTds: Number(voucherRow.voucher_tds || 0),
      securityDeposit: Number(voucherRow.security_deposit || 0),
      laborCess: Number(voucherRow.labor_cess || 0),
      earliestDate: voucherRow.earliest_date,
      latestDate: voucherRow.latest_date,
    },
    dataSource: importResult.rows[0]
      ? {
          fileName: importResult.rows[0].file_name,
          status: importResult.rows[0].status,
          recordsProcessed: Number(importResult.rows[0].records_processed || 0),
          recordsFailed: Number(importResult.rows[0].records_failed || 0),
          importedAt: importResult.rows[0].created_at,
        }
      : null,
  };
}

export async function getSchemeById(schemeId, financialYearId) {
  const fy = await resolveFinancialYearId(financialYearId);
  if (!fy) return null;

  const schemeResult = await query(`SELECT id, name, code, description FROM schemes WHERE id = $1`, [
    schemeId,
  ]);
  if (!schemeResult.rows[0]) return null;

  const financialResult = await query(
    `SELECT
       COALESCE(sb.budget_amount, 0) AS budget_amount,
       COALESCE(ses.expenditure_amount, 0) AS expenditure_amount,
       COALESCE(ses.in_lakhs, 0) AS in_lakhs,
       COALESCE(ses.in_crores, 0) AS in_crores,
       COALESCE(ses.tds_amount, 0) AS tds_amount,
       COALESCE(ses.cgst_amount, 0) AS cgst_amount,
       COALESCE(ses.sgst_amount, 0) AS sgst_amount,
       COALESCE(ses.igst_amount, 0) AS igst_amount
     FROM schemes s
     LEFT JOIN scheme_expenditure_summaries ses
       ON ses.scheme_id = s.id AND ses.financial_year_id = $2
     LEFT JOIN scheme_budgets sb
       ON sb.scheme_id = s.id AND sb.financial_year_id = $2
     WHERE s.id = $1`,
    [schemeId, fy.id],
  );

  const stats = financialResult.rows[0] || {};
  const budget = Number(stats.budget_amount || 0);
  const expenditure = Number(stats.expenditure_amount || 0);

  const voucherStats = await query(
    `SELECT COUNT(*)::int AS transaction_count,
            COALESCE(SUM(debit_payment), 0) AS voucher_expenditure
     FROM voucher_transactions
     WHERE scheme_id = $1 AND financial_year_id = $2`,
    [schemeId, fy.id],
  );

  const subHeadBreakdown = await query(
    `SELECT sub_head_text, COUNT(*)::int AS count, COALESCE(SUM(debit_payment), 0) AS amount
     FROM voucher_transactions
     WHERE scheme_id = $1 AND financial_year_id = $2 AND sub_head_text IS NOT NULL
     GROUP BY sub_head_text
     ORDER BY amount DESC
     LIMIT 20`,
    [schemeId, fy.id],
  );

  return {
    scheme: schemeResult.rows[0],
    financialYear: fy,
    hasBudgetData: budget > 0,
    budgetAmount: budget,
    expenditureAmount: expenditure,
    remainingBudget: budget > 0 ? budget - expenditure : null,
    utilizationPercent: budget > 0 ? (expenditure / budget) * 100 : null,
    inLakhs: Number(stats.in_lakhs || 0),
    inCrores: Number(stats.in_crores || 0),
    taxSummary: {
      tds: Number(stats.tds_amount || 0),
      cgst: Number(stats.cgst_amount || 0),
      sgst: Number(stats.sgst_amount || 0),
      igst: Number(stats.igst_amount || 0),
    },
    voucherSummary: voucherStats.rows[0],
    subHeadBreakdown: subHeadBreakdown.rows,
  };
}

export async function listSchemes(financialYearId, search = '') {
  const data = await getSchemeBreakdown(financialYearId, search);
  return data;
}
