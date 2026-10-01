import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import SchemeCard from '../components/schemes/SchemeCard';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { api } from '../services/api';
import { formatINR } from '../utils/formatINR';

export default function SchemesPage() {
  const [financialYearId, setFinancialYearId] = useState('');
  const [search, setSearch] = useState('');
  const [summary, setSummary] = useState(null);
  const [schemesData, setSchemesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const fyParam = financialYearId ? Number(financialYearId) : undefined;
      const [summaryRes, schemesRes] = await Promise.all([
        api.getSummary(fyParam),
        api.getSchemes(fyParam, search),
      ]);
      setSummary(summaryRes);
      setSchemesData(schemesRes);
      if (!financialYearId && summaryRes.financialYear?.id) {
        setFinancialYearId(String(summaryRes.financialYear.id));
      }
    } catch (err) {
      setError(err.message || 'Failed to load schemes');
    } finally {
      setLoading(false);
    }
  }, [financialYearId, search]);

  useEffect(() => {
    const timer = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  const schemes = useMemo(() => {
    const rows = schemesData?.schemes || [];
    return [...rows].sort((a, b) => b.expenditureAmount - a.expenditureAmount);
  }, [schemesData]);

  const totalExp = Number(summary?.totalExpenditure || 0);
  const withSpend = schemes.filter((s) => s.expenditureAmount > 0).length;

  return (
    <AdminLayout
      pageTitle="Schemes"
      financialYears={summary?.financialYears || []}
      financialYearId={financialYearId}
      onFinancialYearChange={setFinancialYearId}
    >
      <div className="space-y-5 pb-10">
        <div className="hfms-card flex flex-wrap items-end justify-between gap-4 p-5">
          <div>
            <h2 className="text-lg font-bold text-gov-navy">All welfare schemes</h2>
            <p className="mt-1 text-sm text-gov-muted">
              {schemes.length} schemes · {withSpend} with expenditure · FY{' '}
              {summary?.financialYear?.label || '—'}
            </p>
            <p className="mt-1 text-xs text-gov-muted">
              Total FY expenditure:{' '}
              <span className="font-semibold text-gov-navy">{formatINR(totalExp)}</span>
            </p>
          </div>
          <label className="w-full max-w-sm">
            <span className="mb-1 block text-xs font-medium text-gov-muted">Search</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Scheme name or code…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-gov-blue focus:ring-2 focus:ring-gov-blue/15"
            />
          </label>
        </div>

        {loading ? <LoadingState label="Loading schemes…" /> : null}
        {!loading && error ? <ErrorState message={error} onRetry={load} /> : null}

        {!loading && !error ? (
          schemes.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {schemes.map((scheme) => (
                <SchemeCard
                  key={scheme.id}
                  scheme={scheme}
                  financialYearId={financialYearId}
                  totalExpenditure={totalExp}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-gov-muted">
              No schemes match your search.
            </p>
          )
        ) : null}
      </div>
    </AdminLayout>
  );
}
