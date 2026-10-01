import { formatINR, formatPercent } from '../utils/formatINR';

const CARD_THEMES = [
  { accent: 'border-l-[#172554]', chip: 'bg-blue-50 text-[#172554]' },
  { accent: 'border-l-gov-saffron', chip: 'bg-orange-50 text-orange-700' },
  { accent: 'border-l-[#1f5a8a]', chip: 'bg-sky-50 text-sky-800' },
  { accent: 'border-l-amber-500', chip: 'bg-amber-50 text-amber-800' },
  { accent: 'border-l-emerald-600', chip: 'bg-emerald-50 text-emerald-800' },
];

function SummaryCard({ label, value, hint, themeIndex = 0 }) {
  const theme = CARD_THEMES[themeIndex % CARD_THEMES.length];
  return (
    <article className={`hfms-card border-l-4 ${theme.accent} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gov-muted">{label}</p>
          <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-gov-navy">{value}</p>
          {hint ? <p className="mt-2 text-xs text-gov-muted">{hint}</p> : null}
        </div>
        <span className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase ${theme.chip}`}>
          Live
        </span>
      </div>
    </article>
  );
}

export default function SummaryCards({ summary }) {
  if (!summary) return null;

  const cards = [
    summary.hasBudgetData
      ? { label: 'Total Budget', value: formatINR(summary.totalBudget), hint: 'All schemes' }
      : null,
    {
      label: 'Total Expenditure',
      value: formatINR(summary.totalExpenditure),
      hint: summary.financialYear ? `FY ${summary.financialYear.label}` : undefined,
    },
    summary.hasBudgetData
      ? { label: 'Remaining Budget', value: formatINR(summary.remainingBudget), hint: 'Available' }
      : null,
    summary.hasBudgetData
      ? {
          label: 'Utilization',
          value: formatPercent(summary.utilizationPercent),
          hint: 'Overall',
        }
      : null,
    {
      label: 'Total Schemes',
      value: String(summary.schemeCount || 0),
      hint: 'With records',
    },
  ].filter(Boolean);

  return (
    <section aria-label="Financial summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card, index) => (
        <SummaryCard key={card.label} {...card} themeIndex={index} />
      ))}
    </section>
  );
}
