export function IconDashboard(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 13h6V4H4v9Zm10 7h6V11h-6v9ZM4 20h6v-5H4v5Zm10-9h6V4h-6v7Z" />
    </svg>
  );
}

export function IconChart(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 19V5M10 19V9M16 19v-6M22 19V3" />
    </svg>
  );
}

export function IconInsights(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z" />
    </svg>
  );
}

export function IconSchemes(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  );
}

export function IconReport(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M8 4h8l2 2v14H6V4h2Zm0 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

export function IconSettings(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a7.8 7.8 0 0 0 .1-6l2-1.2-2-3.4-2.3 1a7.9 7.9 0 0 0-5.2-3V1h-4v2.4a7.9 7.9 0 0 0-5.2 3l-2.3-1-2 3.4 2 1.2a7.8 7.8 0 0 0 0 6l-2 1.2 2 3.4 2.3-1a7.9 7.9 0 0 0 5.2 3V23h4v-2.4a7.9 7.9 0 0 0 5.2-3l2.3 1 2-3.4-2-1.2Z" />
    </svg>
  );
}

export function IconMenu(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconBell(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16l-2-2ZM10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function IconLogout(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M10 17l5-5-5-5M15 12H4M4 4h8a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

const iconMap = {
  dashboard: IconDashboard,
  financial: IconDashboard,
  insights: IconInsights,
  schemes: IconSchemes,
  reports: IconReport,
  settings: IconSettings,
};

export function NavIcon({ name, ...props }) {
  const Icon = iconMap[name] || IconDashboard;
  return <Icon {...props} />;
}
