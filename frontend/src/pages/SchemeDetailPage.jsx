import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { api } from '../services/api';
import { formatINR, formatPercent } from '../utils/formatINR';

export default function SchemeDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const financialYearId = searchParams.get('financialYearId');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .getScheme(id, financialYearId ? Number(financialYearId) : undefined)
      .then((res) => {
        if (active) setData(res);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load scheme');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, financialYearId]);

  const backHref = '/schemes';

  return (
    <AdminLayout pageTitle="Scheme details">
      <div className="space-y-6 pb-10">
        <Link
          to={backHref}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#1d3d7d] hover:underline"
        >
          ← Back to schemes
        </Link>

        {loading ? <LoadingState label="Loading scheme details…" /> : null}
        {!loading && error ? <ErrorState message={error} /> : null}

        {!loading && !error && data ? (
          <>
            <section className="hfms-card p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-gov-saffron">
                Welfare scheme
              </p>
              <h2 className="mt-2 text-xl font-bold leading-snug text-gov-navy md:text-2xl">
                {data.scheme.name}
              </h2>
              {data.scheme.code ? (
                <p className="mt-1 text-sm text-gov-muted">Code: {data.scheme.code}</p>
              ) : null}
              <p className="mt-2 text-sm text-gov-muted">
                Financial year: {data.financialYear?.label}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {data.hasBudgetData ? (
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase text-gov-muted">Budget</p>
                    <p className="mt-1 text-lg font-bold tabular-nums text-gov-navy">
                      {formatINR(data.budgetAmount)}
                    </p>
                  </div>
                ) : null}
                <div className="rounded-xl bg-orange-50/80 p-4">
                  <p className="text-xs font-medium uppercase text-gov-muted">Expenditure</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-gov-saffron">
                    {formatINR(data.expenditureAmount)}
                  </p>
                </div>
                {data.hasBudgetData ? (
                  <>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase text-gov-muted">Remaining</p>
                      <p className="mt-1 text-lg font-bold tabular-nums">
                        {data.remainingBudget == null ? '—' : formatINR(data.remainingBudget)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase text-gov-muted">Utilization</p>
                      <p className="mt-1 text-lg font-bold tabular-nums">
                        {data.utilizationPercent == null
                          ? '—'
                          : formatPercent(data.utilizationPercent)}
                      </p>
                    </div>
                  </>
                ) : null}
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <article className="hfms-card p-5">
                <h3 className="text-sm font-bold text-gov-navy">Workbook summary</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                    <dt className="text-gov-muted">In lakhs</dt>
                    <dd className="font-semibold tabular-nums">{data.inLakhs}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gov-muted">In crores</dt>
                    <dd className="font-semibold tabular-nums">{data.inCrores}</dd>
                  </div>
                </dl>
              </article>
              <article className="hfms-card p-5">
                <h3 className="text-sm font-bold text-gov-navy">Tax components (Sheet1)</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  {[
                    ['TDS', data.taxSummary.tds],
                    ['CGST', data.taxSummary.cgst],
                    ['SGST', data.taxSummary.sgst],
                    ['IGST', data.taxSummary.igst],
                  ].map(([label, amount]) => (
                    <div key={label} className="flex justify-between gap-4">
                      <dt className="text-gov-muted">{label}</dt>
                      <dd className="font-medium tabular-nums">{formatINR(amount)}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            </section>

            {Number(data.voucherSummary?.transaction_count) > 0 ? (
              <section className="hfms-card p-5">
                <h3 className="text-sm font-bold text-gov-navy">Voucher drill-down</h3>
                <p className="mt-2 text-sm text-gov-muted">
                  {data.voucherSummary.transaction_count} voucher rows · Total debit{' '}
                  {formatINR(data.voucherSummary.voucher_expenditure)}
                </p>
                {data.subHeadBreakdown?.length ? (
                  <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr className="text-left text-xs uppercase text-gov-muted">
                          <th className="px-4 py-3">Sub-head</th>
                          <th className="px-4 py-3">Count</th>
                          <th className="px-4 py-3">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.subHeadBreakdown.map((row) => (
                          <tr key={row.sub_head_text} className="border-t border-slate-100">
                            <td className="px-4 py-2.5">{row.sub_head_text}</td>
                            <td className="px-4 py-2.5 tabular-nums">{row.count}</td>
                            <td className="px-4 py-2.5 tabular-nums">{formatINR(row.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </section>
            ) : (
              <section className="hfms-card p-5 text-sm text-gov-muted">
                Detailed voucher rows are not imported yet. Re-import the workbook with voucher
                import enabled to see transaction-level drill-down.
              </section>
            )}
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
