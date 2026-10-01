const REPORTS = [
  { title: 'Monthly Expenditure Summary', date: 'Mar 2026' },
  { title: 'Scheme-wise Utilization Report', date: 'Mar 2026' },
  { title: 'Quarterly Financial Statement', date: 'Q4 2025-26' },
];

function DocIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 4h6l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M14 4v4h4M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function RecentReportsPanel({ financialYearLabel }) {
  return (
    <aside className="hfms-card p-5">
      <h3 className="text-sm font-semibold text-gov-navy">Recent Reports</h3>
      <p className="mt-1 text-xs text-gov-muted">
        {financialYearLabel ? `FY ${financialYearLabel}` : 'Financial reports'}
      </p>
      <ul className="mt-4 space-y-3">
        {REPORTS.map((report) => (
          <li
            key={report.title}
            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition hover:bg-slate-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-gov-blue shadow-sm ring-1 ring-slate-100">
              <DocIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gov-text">{report.title}</p>
              <p className="text-xs text-gov-muted">{report.date}</p>
            </div>
            <button
              type="button"
              disabled
              className="shrink-0 rounded-lg bg-gov-navy/5 px-2.5 py-1.5 text-xs font-medium text-gov-navy opacity-60"
              title="Reports module coming soon"
            >
              Download
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-gov-muted">
        Report downloads will be enabled when the Reports module is added.
      </p>
    </aside>
  );
}
