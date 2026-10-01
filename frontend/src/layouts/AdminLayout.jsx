import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { ORG } from '../constants/theme';
import Sidebar from '../components/layout/Sidebar';
import TopHeader from '../components/layout/TopHeader';

export default function AdminLayout({
  children,
  pageTitle = 'Financial Dashboard',
  financialYears,
  financialYearId,
  onFinancialYearChange,
  fixedViewport = false,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const shellClass = fixedViewport
    ? 'relative flex h-screen overflow-hidden bg-gov-bg'
    : 'relative min-h-screen bg-gov-bg';

  const mainClass = fixedViewport
    ? 'flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-3 sm:px-5 sm:py-4 lg:px-6'
    : 'flex-1 px-3 py-4 sm:px-5 sm:py-5 lg:px-7 lg:py-6';

  return (
    <div className={shellClass}>
      <div className={`relative z-10 flex w-full ${fixedViewport ? 'h-full min-h-0' : 'min-h-screen'} lg:flex`}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className={`flex min-w-0 flex-1 flex-col ${fixedViewport ? 'h-full min-h-0' : 'min-h-screen'}`}>
          <TopHeader
            title={pageTitle}
            onMenuClick={() => setSidebarOpen(true)}
            user={user}
            onLogout={handleLogout}
            financialYears={financialYears}
            financialYearId={financialYearId}
            onFinancialYearChange={onFinancialYearChange}
          />

          <main className={mainClass}>{children}</main>

          {!fixedViewport ? (
            <footer className="border-t border-slate-200 bg-white px-4 py-2.5 text-center text-[11px] text-gov-muted">
              {ORG.systemName} · Government of Gujarat
            </footer>
          ) : null}
        </div>
      </div>
    </div>
  );
}
