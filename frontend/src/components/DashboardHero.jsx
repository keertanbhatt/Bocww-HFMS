import { ORG } from '../constants/theme';

export default function DashboardHero({ financialYearLabel, schemeCount, totalExpenditureLabel }) {
  const subtitle = [
    financialYearLabel ? `Financial Year ${financialYearLabel}` : null,
    schemeCount != null ? `${schemeCount} active schemes` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <section className="hfms-card overflow-hidden p-0">
      <div className="bg-gradient-to-r from-[#172554] to-[#1e3a8a] px-4 py-4 sm:flex sm:items-center sm:justify-between sm:px-6 sm:py-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-orange-200/90">
            Overview
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
            {ORG.systemName} · Financial Dashboard
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-blue-100/90">{subtitle}</p>
          ) : null}
        </div>

        {totalExpenditureLabel ? (
          <div className="mt-3 shrink-0 rounded-xl bg-white px-5 py-3 shadow-sm sm:mt-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gov-muted">
              Total expenditure
            </p>
            <p className="text-lg font-bold tabular-nums text-gov-navy">{totalExpenditureLabel}</p>
          </div>
        ) : null}
      </div>
      <div className="hfms-saffron-rule" />
    </section>
  );
}
