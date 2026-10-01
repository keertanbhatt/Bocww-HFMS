import { formatCompactINR, formatINR, formatPercent } from '../utils/formatINR';

function StatPill({ label, value, sub }) {
  return (
    <div className="flex min-w-[9rem] flex-1 flex-col rounded-xl border border-slate-100 bg-white/90 px-4 py-3">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-gov-muted">{label}</span>
      <span className="mt-1 text-lg font-bold tabular-nums text-gov-navy">{value}</span>
      {sub ? <span className="mt-0.5 text-[11px] text-gov-muted">{sub}</span> : null}
    </div>
  );
}

export default function DashboardStatsStrip({ summary, schemes = [] }) {
  if (!summary) return null;

  const totalExp = Number(summary.totalExpenditure || 0);
  const withSpend = schemes.filter((s) => s.expenditureAmount > 0);
  const taxTotal = schemes.reduce(
    (acc, s) =>
      acc + (s.tdsAmount || 0) + (s.cgstAmount || 0) + (s.sgstAmount || 0) + (s.igstAmount || 0),
    0,
  );
  const avgSpend = withSpend.length ? totalExp / withSpend.length : 0;
  const top = withSpend[0];
  const highTier = withSpend.filter((s) => (s.inLakhs || 0) >= 500).length;

  return (
    <section
      aria-label="Key metrics"
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <StatPill
        label="Total expenditure"
        value={formatINR(totalExp)}
        sub={summary.financialYear ? `FY ${summary.financialYear.label}` : undefined}
      />
      {summary.hasBudgetData ? (
        <>
          <StatPill label="Total budget" value={formatINR(summary.totalBudget)} />
          <StatPill
            label="Utilization"
            value={formatPercent(summary.utilizationPercent)}
            sub={formatINR(summary.remainingBudget) + ' remaining'}
          />
        </>
      ) : null}
      <StatPill label="Active schemes" value={String(withSpend.length)} sub={`${summary.schemeCount || 0} total`} />
      <StatPill label="Avg per scheme" value={formatCompactINR(avgSpend)} />
      <StatPill label="Tax & deductions" value={formatCompactINR(taxTotal)} sub="TDS + GST (summed)" />
      <StatPill
        label="High spend (≥500 L)"
        value={String(highTier)}
        sub={top ? `Top: ${top.name.slice(0, 28)}${top.name.length > 28 ? '…' : ''}` : undefined}
      />
    </section>
  );
}
