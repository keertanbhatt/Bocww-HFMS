import { Link, useSearchParams } from 'react-router-dom';
import { DASHBOARD_TABS } from '../../constants/navigation';

export default function DashboardTabNav() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  return (
    <nav
      className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
      aria-label="Dashboard sections"
    >
      {DASHBOARD_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const to = tab.id === 'overview' ? '/dashboard' : `/dashboard?tab=${tab.id}`;
        return (
          <Link
            key={tab.id}
            to={to}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              isActive
                ? 'bg-[#1d3d7d] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-[#1d3d7d]'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
