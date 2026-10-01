import { Link } from 'react-router-dom';
import { formatINR, formatPercent } from '../../utils/formatINR';

function tierMeta(scheme) {
  if (scheme.expenditureAmount <= 0) {
    return { label: 'No spend', className: 'bg-slate-100 text-slate-600' };
  }
  if (scheme.inLakhs >= 500) {
    return { label: 'High spend', className: 'bg-orange-100 text-orange-800' };
  }
  if (scheme.inLakhs >= 50) {
    return { label: 'Moderate', className: 'bg-emerald-100 text-emerald-800' };
  }
  return { label: 'Normal', className: 'bg-blue-100 text-blue-800' };
}

export default function SchemeCard({ scheme, financialYearId, totalExpenditure }) {
  const tier = tierMeta(scheme);
  const share =
    totalExpenditure > 0 ? (scheme.expenditureAmount / totalExpenditure) * 100 : 0;
  const query = financialYearId ? `?financialYearId=${financialYearId}` : '';

  return (
    <Link
      to={`/schemes/${scheme.id}${query}`}
      className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#1d3d7d]/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${tier.className}`}>
          {tier.label}
        </span>
        {share > 0 ? (
          <span className="text-xs font-bold tabular-nums text-gov-saffron">
            {formatPercent(share, 1)}
          </span>
        ) : null}
      </div>
      <h3 className="mt-3 line-clamp-3 flex-1 text-sm font-bold leading-snug text-gov-navy group-hover:text-[#1d3d7d]">
        {scheme.name}
      </h3>
      {scheme.code ? (
        <p className="mt-1 text-xs text-gov-muted">Code: {scheme.code}</p>
      ) : null}
      <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs">
        <div className="flex justify-between gap-2">
          <dt className="text-gov-muted">Expenditure</dt>
          <dd className="font-bold tabular-nums text-gov-navy">
            {formatINR(scheme.expenditureAmount)}
          </dd>
        </div>
        {scheme.inLakhs > 0 ? (
          <div className="flex justify-between gap-2">
            <dt className="text-gov-muted">In lakhs (sheet)</dt>
            <dd className="tabular-nums">{Number(scheme.inLakhs).toFixed(2)} L</dd>
          </div>
        ) : null}
        {scheme.totalTaxAmount > 0 ? (
          <div className="flex justify-between gap-2">
            <dt className="text-gov-muted">TDS + GST</dt>
            <dd className="tabular-nums">{formatINR(scheme.totalTaxAmount)}</dd>
          </div>
        ) : null}
      </dl>
      <p className="mt-4 text-xs font-semibold text-[#1d3d7d] opacity-80 group-hover:opacity-100">
        View details →
      </p>
    </Link>
  );
}
