import { formatCompactINR, formatINR, formatPercent } from '../utils/formatINR';

function KpiCard({ label, value, hint, accent = 'border-l-[#1d3d7d]' }) {
  return (
    <article className={`hfms-card border-l-4 ${accent} p-4`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gov-muted">{label}</p>
      <p className="mt-1.5 text-xl font-bold tabular-nums text-gov-navy">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-gov-muted">{hint}</p> : null}
    </article>
  );
}

export default function DashboardKpiGrid({ summary, analytics, schemes = [] }) {
  if (!summary) return null;

  const withSpend = schemes.filter((s) => s.expenditureAmount > 0);
  const taxes = analytics?.taxes;
  const sheet = analytics?.sheetTotals;
  const tiers = analytics?.tierCounts;

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
      <KpiCard
        label="Total expenditure"
        value={formatINR(summary.totalExpenditure)}
        hint={summary.financialYear ? `FY ${summary.financialYear.label}` : undefined}
        accent="border-l-gov-saffron"
      />
      <KpiCard
        label="Sheet total (lakhs)"
        value={sheet ? `${Number(sheet.inLakhs).toFixed(2)} L` : '—'}
        hint="Sum from Sheet1 pivot"
      />
      <KpiCard
        label="Sheet total (crores)"
        value={sheet ? `${Number(sheet.inCrores).toFixed(4)} Cr` : '—'}
        hint="Excel in_crores column"
      />
      <KpiCard
        label="TDS (summaries)"
        value={taxes ? formatCompactINR(taxes.tds) : '—'}
        hint="Scheme expenditure sheet"
        accent="border-l-amber-500"
      />
      <KpiCard
        label="GST total"
        value={taxes ? formatCompactINR(taxes.gstTotal) : '—'}
        hint="CGST + SGST + IGST"
        accent="border-l-emerald-600"
      />
      <KpiCard
        label="Schemes with spend"
        value={`${withSpend.length} / ${summary.schemeCount || 0}`}
        hint={
          tiers
            ? `High ${tiers.high} · Mod ${tiers.moderate} · Normal ${tiers.normal}`
            : undefined
        }
      />
      {summary.hasBudgetData ? (
        <>
          <KpiCard label="Total budget" value={formatINR(summary.totalBudget)} />
          <KpiCard
            label="Utilization"
            value={formatPercent(summary.utilizationPercent)}
            hint={`${formatINR(summary.remainingBudget)} remaining`}
          />
        </>
      ) : null}
    </section>
  );
}
