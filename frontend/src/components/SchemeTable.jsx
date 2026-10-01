import { Link } from 'react-router-dom';
import { formatINR, formatPercent } from '../utils/formatINR';

function schemeStatus(scheme) {
  if (scheme.expenditureAmount <= 0) {
    return { label: 'No spend', className: 'bg-slate-100 text-slate-600' };
  }
  if (scheme.inLakhs >= 500) {
    return { label: 'High', className: 'bg-orange-100 text-orange-800' };
  }
  if (scheme.inLakhs >= 50) {
    return { label: 'Moderate', className: 'bg-emerald-100 text-emerald-800' };
  }
  return { label: 'Normal', className: 'bg-blue-100 text-blue-800' };
}

export default function SchemeTable({
  schemes,
  hasBudgetData,
  financialYearId,
  search,
  onSearchChange,
  totalExpenditure = 0,
}) {
  return (
    <div className="hfms-card overflow-hidden">
      <div className="sticky top-14 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3 sm:px-5 lg:top-[4.25rem]">
        <div>
          <h3 className="text-sm font-bold text-gov-navy">Scheme register (Excel Sheet1)</h3>
          <p className="text-xs text-gov-muted">
            Expenditure, lakhs/crores, TDS &amp; GST — {schemes?.length || 0} rows
          </p>
        </div>
        <label className="w-full max-w-xs">
          <span className="sr-only">Search schemes</span>
          <input
            type="search"
            value={search || ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search by name or code…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-gov-blue focus:ring-2 focus:ring-gov-blue/15"
          />
        </label>
      </div>

      {!schemes?.length ? (
        <div className="p-8 text-center text-sm text-gov-muted">
          No scheme financial records found for the selected filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-[6.5rem] z-20 bg-white text-[11px] uppercase tracking-wide text-gov-muted shadow-[0_1px_0_0_rgb(226_232_240)] lg:top-[7.5rem]">
              <tr>
                <th className="px-4 py-2.5 font-semibold">#</th>
                <th className="px-4 py-2.5 font-semibold">Scheme</th>
                <th className="hidden px-4 py-2.5 font-semibold md:table-cell">Code</th>
                {hasBudgetData ? (
                  <th className="px-4 py-2.5 font-semibold text-right">Budget</th>
                ) : null}
                <th className="px-4 py-2.5 font-semibold text-right">Expenditure</th>
                <th className="px-4 py-2.5 font-semibold text-right">Share</th>
                <th className="hidden px-4 py-2.5 font-semibold text-right lg:table-cell">
                  Lakhs
                </th>
                <th className="hidden px-4 py-2.5 font-semibold text-right xl:table-cell">
                  Crores
                </th>
                <th className="hidden px-4 py-2.5 font-semibold text-right lg:table-cell">
                  TDS
                </th>
                <th className="hidden px-4 py-2.5 font-semibold text-right 2xl:table-cell">
                  CGST
                </th>
                <th className="hidden px-4 py-2.5 font-semibold text-right 2xl:table-cell">
                  SGST
                </th>
                <th className="hidden px-4 py-2.5 font-semibold text-right 2xl:table-cell">
                  IGST
                </th>
                <th className="hidden px-4 py-2.5 font-semibold text-right xl:table-cell">
                  Total tax
                </th>
                {hasBudgetData ? (
                  <th className="px-4 py-2.5 font-semibold text-right">Util.</th>
                ) : null}
                <th className="px-4 py-2.5 font-semibold text-right">Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schemes.map((scheme, index) => {
                const status = schemeStatus(scheme);
                const share =
                  totalExpenditure > 0
                    ? (scheme.expenditureAmount / totalExpenditure) * 100
                    : 0;
                return (
                  <tr key={scheme.id} className="transition hover:bg-slate-50/80">
                    <td className="px-4 py-2.5 tabular-nums text-gov-muted">{index + 1}</td>
                    <td className="max-w-[16rem] px-4 py-2.5 font-medium text-gov-text">
                      <Link
                        to={`/schemes/${scheme.id}${financialYearId ? `?financialYearId=${financialYearId}` : ''}`}
                        className="line-clamp-2 text-gov-blue hover:text-gov-navy hover:underline"
                      >
                        {scheme.name}
                      </Link>
                    </td>
                    <td className="hidden px-4 py-2.5 text-xs text-gov-muted md:table-cell">
                      {scheme.code || '—'}
                    </td>
                    {hasBudgetData ? (
                      <td className="px-4 py-2.5 text-right tabular-nums text-gov-muted">
                        {formatINR(scheme.budgetAmount)}
                      </td>
                    ) : null}
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-gov-navy">
                      {formatINR(scheme.expenditureAmount)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="tabular-nums text-xs font-medium text-gov-saffron">
                        {formatPercent(share, 1)}
                      </span>
                    </td>
                    <td className="hidden px-4 py-2.5 text-right tabular-nums text-gov-muted lg:table-cell">
                      {scheme.inLakhs ? Number(scheme.inLakhs).toFixed(2) : '—'}
                    </td>
                    <td className="hidden px-4 py-2.5 text-right tabular-nums text-gov-muted xl:table-cell">
                      {scheme.inCrores ? Number(scheme.inCrores).toFixed(4) : '—'}
                    </td>
                    <td className="hidden px-4 py-2.5 text-right tabular-nums text-gov-muted lg:table-cell">
                      {scheme.tdsAmount ? formatINR(scheme.tdsAmount) : '—'}
                    </td>
                    <td className="hidden px-4 py-2.5 text-right tabular-nums text-gov-muted 2xl:table-cell">
                      {scheme.cgstAmount ? formatINR(scheme.cgstAmount) : '—'}
                    </td>
                    <td className="hidden px-4 py-2.5 text-right tabular-nums text-gov-muted 2xl:table-cell">
                      {scheme.sgstAmount ? formatINR(scheme.sgstAmount) : '—'}
                    </td>
                    <td className="hidden px-4 py-2.5 text-right tabular-nums text-gov-muted 2xl:table-cell">
                      {scheme.igstAmount ? formatINR(scheme.igstAmount) : '—'}
                    </td>
                    <td className="hidden px-4 py-2.5 text-right tabular-nums font-medium text-gov-navy xl:table-cell">
                      {scheme.totalTaxAmount ? formatINR(scheme.totalTaxAmount) : '—'}
                    </td>
                    {hasBudgetData ? (
                      <td className="px-4 py-2.5 text-right tabular-nums text-gov-muted">
                        {scheme.utilizationPercent == null
                          ? '—'
                          : formatPercent(scheme.utilizationPercent)}
                      </td>
                    ) : null}
                    <td className="px-4 py-2.5 text-right">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
