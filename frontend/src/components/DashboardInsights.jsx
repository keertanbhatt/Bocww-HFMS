import { formatCompactINR, formatINR, formatPercent } from '../utils/formatINR';

export default function DashboardInsights({ schemes = [], totalExpenditure = 0 }) {
  const active = schemes.filter((s) => s.expenditureAmount > 0);
  const topFive = active.slice(0, 5).map((s) => ({
    ...s,
    share: totalExpenditure > 0 ? (s.expenditureAmount / totalExpenditure) * 100 : 0,
  }));

  const taxBreakdown = active.reduce(
    (acc, s) => {
      acc.tds += s.tdsAmount || 0;
      acc.gst += (s.cgstAmount || 0) + (s.sgstAmount || 0) + (s.igstAmount || 0);
      return acc;
    },
    { tds: 0, gst: 0 },
  );

  return (
    <aside className="flex h-full min-h-0 flex-col hfms-card">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-bold text-gov-navy">Expenditure insights</h2>
        <p className="text-xs text-gov-muted">Top schemes & tax summary</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <ul className="space-y-3">
          {topFive.map((scheme, index) => (
            <li key={scheme.id}>
              <div className="flex items-start justify-between gap-2 text-xs">
                <span className="font-semibold text-gov-navy">
                  <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-md bg-gov-navy/10 text-[10px] text-gov-navy">
                    {index + 1}
                  </span>
                  <span className="line-clamp-2">{scheme.name}</span>
                </span>
                <span className="shrink-0 font-bold tabular-nums text-gov-saffron">
                  {formatPercent(scheme.share, 1)}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gov-navy to-gov-saffron"
                  style={{ width: `${Math.min(scheme.share, 100)}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] tabular-nums text-gov-muted">
                {formatINR(scheme.expenditureAmount)}
                {scheme.inLakhs ? ` · ${Number(scheme.inLakhs).toFixed(2)} L (sheet)` : ''}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase text-gov-muted">TDS</p>
            <p className="text-sm font-bold text-gov-navy">{formatCompactINR(taxBreakdown.tds)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase text-gov-muted">GST</p>
            <p className="text-sm font-bold text-gov-navy">{formatCompactINR(taxBreakdown.gst)}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
