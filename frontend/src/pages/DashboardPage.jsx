import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import DashboardCharts from '../components/DashboardCharts';
import DashboardExtendedPanels from '../components/DashboardExtendedPanels';
import DashboardHero from '../components/DashboardHero';
import DashboardInsightsTab from '../components/dashboard/DashboardInsightsTab';
import DashboardKpiGrid from '../components/DashboardKpiGrid';
import DashboardTabNav from '../components/dashboard/DashboardTabNav';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import SchemeTable from '../components/SchemeTable';
import { api } from '../services/api';
import { formatINR } from '../utils/formatINR';

export default function DashboardPage() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [financialYearId, setFinancialYearId] = useState('');
  const [search, setSearch] = useState('');
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [schemesData, setSchemesData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const fyParam = financialYearId ? Number(financialYearId) : undefined;
      const searchForApi = activeTab === 'register' ? search : '';
      const [summaryRes, analyticsRes, schemesRes, chartsRes] = await Promise.all([
        api.getSummary(fyParam),
        api.getAnalytics(fyParam),
        api.getSchemes(fyParam, searchForApi),
        api.getCharts(fyParam),
      ]);
      setSummary(summaryRes);
      setAnalytics(analyticsRes);
      setSchemesData(schemesRes);
      setChartData(chartsRes);
      if (!financialYearId && summaryRes.financialYear?.id) {
        setFinancialYearId(String(summaryRes.financialYear.id));
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [financialYearId, search, activeTab]);

  useEffect(() => {
    const debounce = activeTab === 'register' && search ? 300 : 0;
    const timer = setTimeout(loadDashboard, debounce);
    return () => clearTimeout(timer);
  }, [loadDashboard, search, activeTab]);

  const financialYears = summary?.financialYears || [];
  const hasBudgetData = schemesData?.hasBudgetData || summary?.hasBudgetData;
  const totalExpenditure = Number(summary?.totalExpenditure || 0);

  const schemes = useMemo(() => schemesData?.schemes || [], [schemesData]);

  const pageTitle =
    activeTab === 'insights'
      ? 'Insights'
      : activeTab === 'register'
        ? 'Scheme register'
        : 'Financial Dashboard';

  return (
    <AdminLayout
      pageTitle={pageTitle}
      financialYears={financialYears}
      financialYearId={financialYearId}
      onFinancialYearChange={setFinancialYearId}
    >
      <div className="space-y-5 pb-10">
        <DashboardTabNav />

        {activeTab === 'overview' ? (
          <DashboardHero
            financialYearLabel={summary?.financialYear?.label}
            schemeCount={summary?.schemeCount}
            totalExpenditureLabel={
              summary?.totalExpenditure != null ? formatINR(summary.totalExpenditure) : null
            }
          />
        ) : null}

        {loading ? (
          <div className="py-16">
            <LoadingState label="Loading financial dashboard…" />
          </div>
        ) : null}

        {!loading && error ? (
          <ErrorState message={error} onRetry={loadDashboard} />
        ) : null}

        {!loading && !error ? (
          <>
            {activeTab === 'overview' ? (
              <>
                <DashboardKpiGrid summary={summary} analytics={analytics} schemes={schemes} />
                <DashboardExtendedPanels analytics={analytics} chartData={chartData} />
                <div className="h-[19rem] min-h-0">
                  <DashboardCharts chartData={chartData} summary={summary} compact />
                </div>
              </>
            ) : null}

            {activeTab === 'insights' ? (
              <DashboardInsightsTab
                summary={summary}
                analytics={analytics}
                schemes={schemes}
                chartData={chartData}
              />
            ) : null}

            {activeTab === 'register' ? (
              <SchemeTable
                schemes={schemes}
                hasBudgetData={hasBudgetData}
                financialYearId={financialYearId}
                search={search}
                onSearchChange={setSearch}
                totalExpenditure={totalExpenditure}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
