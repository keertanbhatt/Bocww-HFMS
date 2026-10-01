import { IconBell, IconLogout, IconMenu } from '../icons/NavIcons';

export default function TopHeader({
  title,
  onMenuClick,
  user,
  onLogout,
  financialYears = [],
  financialYearId,
  onFinancialYearChange,
}) {
  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm shadow-slate-900/5">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-xl p-2 text-gov-navy hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <IconMenu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gov-saffron">
              Admin Portal
            </p>
            <h1 className="text-lg font-bold tracking-tight text-gov-navy sm:text-xl">{title}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {financialYears.length ? (
            <select
              value={financialYearId || ''}
              onChange={(e) => onFinancialYearChange?.(e.target.value)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-gov-navy outline-none ring-gov-saffron/30 focus:ring-2"
              aria-label="Financial year"
            >
              {financialYears.map((fy) => (
                <option key={fy.id} value={fy.id}>
                  FY {fy.label}
                </option>
              ))}
            </select>
          ) : null}

          <button
            type="button"
            className="relative rounded-xl border border-slate-100 bg-white p-2.5 text-gov-muted hover:border-gov-saffron/30 hover:text-gov-navy"
            aria-label="Notifications"
          >
            <IconBell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gov-saffron" />
          </button>

          <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-white py-1 pl-1 pr-3 shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gov-navy text-xs font-bold text-white">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold leading-none text-gov-navy">
                {user?.name}
              </p>
              <p className="text-[11px] text-gov-muted">{user?.role || 'Administrator'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="rounded-xl border border-slate-100 bg-white p-2.5 text-gov-navy hover:border-gov-saffron/40 hover:bg-orange-50"
            aria-label="Logout"
          >
            <IconLogout className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="hfms-saffron-rule" aria-hidden />
    </header>
  );
}
