import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../constants/navigation';
import { ORG } from '../../constants/theme';
import { NavIcon } from '../icons/NavIcons';
import BrandEmblem from './BrandEmblem';

function isNavItemActive(item, location) {
  if (!item.enabled) return false;

  if (item.id === 'schemes') {
    return location.pathname.startsWith('/schemes');
  }

  if (item.id === 'financial' || item.id === 'insights') {
    if (location.pathname !== '/dashboard') return false;
    const tab = new URLSearchParams(location.search).get('tab') || 'overview';
    if (item.id === 'financial') return tab === 'overview';
    if (item.id === 'insights') return tab === 'insights';
  }

  if (item.path.startsWith('#')) return false;
  return location.pathname === item.path.split('?')[0];
}

export default function Sidebar({ open, onClose }) {
  const location = useLocation();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-[#172554]/60 transition lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col bg-[#172554] text-white shadow-2xl shadow-[#172554]/40 transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-white/10 px-5 pb-5 pt-6">
          <div className="flex flex-col items-center text-center">
            <BrandEmblem className="h-12 w-12" />
            <p className="mt-3 text-sm font-bold leading-snug tracking-tight">
              {ORG.boardNameShort}
            </p>
            <div className="mt-4 h-0.5 w-12 rounded-full bg-gov-saffron" />
          </div>
        </div>

        <div className="px-5 py-4">
          <p className="text-2xl font-bold tracking-tight text-white">{ORG.systemName}</p>
          <p className="text-xs text-white/50">{ORG.systemSubtitle}</p>
        </div>

        <nav className="flex-1 space-y-0.5 px-3" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const active = isNavItemActive(item, location);

            const base =
              'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition';
            const className = active
              ? `${base} bg-white/10 font-semibold text-white`
              : `${base} text-white/65 hover:bg-white/5 hover:text-white`;

            const content = (
              <>
                {active ? (
                  <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gov-saffron" />
                ) : null}
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    active
                      ? 'bg-gov-saffron text-white shadow-md shadow-orange-900/30'
                      : 'bg-white/8 text-white/85'
                  }`}
                >
                  <NavIcon name={item.id} className="h-4 w-4" />
                </span>
                <span className="flex-1">{item.label}</span>
                {!item.enabled ? (
                  <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px]">Soon</span>
                ) : null}
              </>
            );

            if (!item.enabled) {
              return (
                <div key={item.id} className={`${className} cursor-not-allowed opacity-45`}>
                  {content}
                </div>
              );
            }

            return (
              <Link key={item.id} to={item.path} onClick={onClose} className={className}>
                {content}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <p className="text-xs text-white/70">{ORG.taglineGujarati}</p>
        </div>
      </aside>
    </>
  );
}
