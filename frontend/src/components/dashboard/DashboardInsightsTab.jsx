import { formatCompactINR, formatINR, formatPercent } from '../../utils/formatINR';

function InsightCard({ title, body, tone = 'default' }) {
  const tones = {
    default: 'border-slate-200 bg-white',
    highlight: 'border-[#1d3d7d]/20 bg-[#1d3d7d]/5',
    warning: 'border-amber-200 bg-amber-50/80',
  };
  return (
    <article className={`rounded-xl border p-4 ${tones[tone] || tones.default}`}>
      <h4 className="text-sm font-bold text-gov-navy">{title}</h4>
      <p className="mt-2 text-sm leading-relaxed text-gov-muted">{body}</p>
    </article>
  );
}

export default function DashboardInsightsTab({ summary, analytics, schemes = [], chartData }) {
  const totalExp = Number(summary?.totalExpenditure || 0);
  const withSpend = schemes.filter((s) => s.expenditureAmount > 0);
  const sorted = [...withSpend].sort((a, b) => b.expenditureAmount - a.expenditureAmount);
  const top3Share =
    totalExp > 0
      ? sorted.slice(0, 3).reduce((acc, s) => acc + s.expenditureAmount / totalExp, 0) * 100
      : 0;

  const taxes = analytics?.taxes;
  const taxPct = totalExp > 0 && taxes ? (taxes.combined / totalExp) * 100 : 0;
  const sheetLakhs = analytics?.sheetTotals?.inLakhs;
  const bankTotal = (analytics?.bankBalances || []).reduce(
    (acc, b) => acc + (b.balanceCrores || 0),
    0,
  );

  const insights = [];

  if (sorted[0]) {
    insights.push({
      title: 'Largest scheme driver',
      body: `${sorted[0].name} accounts for ${formatPercent(
        totalExp > 0 ? (sorted[0].expenditureAmount / totalExp) * 100 : 0,
        1,
      )} of total expenditure (${formatINR(sorted[0].expenditureAmount)}).`,
      tone: 'highlight',
    });
  }

  insights.push({
    title: 'Concentration (top 3 schemes)',
    body: `The top three schemes represent ${formatPercent(top3Share, 1)} of FY spend. ${
      top3Share > 60
        ? 'Spend is highly concentrated — review high-value schemes regularly.'
        : 'Spend is spread across multiple schemes.'
    }`,
    tone: top3Share > 60 ? 'warning' : 'default',
  });

  if (taxes?.combined > 0) {
    insights.push({
      title: 'Tax & deductions (Sheet1)',
      body: `Combined TDS and GST total ${formatINR(taxes.combined)} (${formatPercent(
        taxPct,
        2,
      )} of expenditure). TDS: ${formatCompactINR(taxes.tds)}, GST: ${formatCompactINR(taxes.gstTotal)}.`,
    });
  }

  if (sheetLakhs != null && totalExp > 0) {
    insights.push({
      title: 'Excel lakhs vs system totals',
      body: `Sheet1 sum of "in lakhs" is ${Number(sheetLakhs).toFixed(2)} L. System expenditure total is ${formatINR(
        totalExp,
      )}. Use both for cross-checking imports.`,
    });
  }

  if (analytics?.tierCounts) {
    const t = analytics.tierCounts;
    insights.push({
      title: 'Spend tiers (from Excel lakhs)',
      body: `${t.high} high (≥500 L), ${t.moderate} moderate (50–500 L), ${t.normal} normal (<50 L), ${t.zero} with no expenditure recorded.`,
    });
  }

  if (bankTotal > 0) {
    insights.push({
      title: 'Bank balances snapshot',
      body: `Imported bank sheet shows ${formatCompactINR(
        bankTotal * 10000000,
      )} equivalent across ${analytics.bankBalances.length} account rows (${bankTotal.toFixed(4)} Cr summed).`,
      tone: 'highlight',
    });
  }

  if (analytics?.vouchers?.hasData) {
    const v = analytics.vouchers;
    insights.push({
      title: 'Voucher detail available',
      body: `${v.transactionCount.toLocaleString('en-IN')} voucher rows loaded. Total debit ${formatINR(
        v.totalDebit,
      )}, beneficiaries ${v.totalBeneficiaries.toLocaleString('en-IN')}. Open a scheme to see sub-head breakdown.`,
    });
  } else {
    insights.push({
      title: 'Voucher-level drill-down',
      body: 'Transaction rows from Main / 2025-2026 sheets are not in the database yet. Scheme summaries from Sheet1 are active; import with vouchers for payment-level insights.',
      tone: 'warning',
    });
  }

  if (analytics?.dataSource) {
    insights.push({
      title: 'Data freshness',
      body: `Last import: ${analytics.dataSource.fileName} (${analytics.dataSource.recordsProcessed} rows processed${
        analytics.dataSource.recordsFailed
          ? `, ${analytics.dataSource.recordsFailed} errors`
          : ''
      }).`,
    });
  }

  const pieTop = chartData?.expenditureShare
    ?.filter((s) => s.value > 0)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {insights.map((item) => (
          <InsightCard key={item.title} {...item} />
        ))}
      </div>

      {pieTop?.length ? (
        <section className="hfms-card p-5">
          <h3 className="text-sm font-bold text-gov-navy">Quick scheme ranking</h3>
          <p className="mt-1 text-xs text-gov-muted">By expenditure share for selected FY</p>
          <ol className="mt-4 space-y-3">
            {pieTop.map((row, index) => {
              const pct = totalExp > 0 ? (row.value / totalExp) * 100 : 0;
              return (
                <li key={row.scheme} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-gov-navy">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gov-text">{row.scheme}</p>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#1d3d7d]"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-gov-saffron">
                    {formatPercent(pct, 1)}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
