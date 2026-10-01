import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_COLORS, COLORS } from '../constants/theme';
import { formatCompactINR, formatINR } from '../utils/formatINR';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 max-w-[14rem] font-semibold text-gov-navy">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {formatCompactINR(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function DashboardCharts({ chartData, summary, compact = false }) {
  if (!chartData) return null;

  const barSource = chartData.budgetVsExpenditure.slice(0, 8);
  const barData = [...barSource].reverse().map((item) => ({
    scheme: item.scheme.length > 36 ? `${item.scheme.slice(0, 36)}…` : item.scheme,
    fullName: item.scheme,
    expenditure: item.expenditure,
    budget: item.budget,
  }));

  const pieData = chartData.expenditureShare
    .filter((item) => item.value > 0)
    .slice(0, 6)
    .map((item) => ({
      name: item.scheme.length > 18 ? `${item.scheme.slice(0, 18)}…` : item.scheme,
      fullName: item.scheme,
      value: item.value,
    }));

  const pieTotal = pieData.reduce((sum, item) => sum + item.value, 0);
  const chartH = compact ? 'h-[11.5rem]' : 'h-80';

  return (
    <section
      className={`grid h-full min-h-0 gap-3 ${compact ? 'grid-cols-1 lg:grid-cols-5' : 'xl:grid-cols-5'}`}
    >
      <article className={`hfms-card flex min-h-0 flex-col p-4 ${compact ? 'lg:col-span-3' : 'xl:col-span-3'}`}>
        <h2 className="shrink-0 text-xs font-bold uppercase tracking-wide text-gov-muted">
          Top schemes by expenditure
        </h2>
        <div className={`mt-2 min-h-0 flex-1 ${chartH}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              layout="vertical"
              margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis
                type="number"
                tickFormatter={(v) => formatCompactINR(v)}
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="scheme"
                width={108}
                tick={{ fontSize: 9, fill: '#334155' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<ChartTooltip />}
                labelFormatter={(_l, items) => items?.[0]?.payload?.fullName || _l}
              />
              <Bar
                dataKey="expenditure"
                name="Expenditure"
                fill={COLORS.navy}
                radius={[0, 4, 4, 0]}
                maxBarSize={14}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className={`hfms-card flex min-h-0 flex-col p-4 ${compact ? 'lg:col-span-2' : 'xl:col-span-2'}`}>
        <h2 className="shrink-0 text-xs font-bold uppercase tracking-wide text-gov-muted">
          Share of spend
        </h2>
        <div className={`relative mt-2 flex min-h-0 flex-1 items-center justify-center ${chartH}`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={compact ? 42 : 58}
                outerRadius={compact ? 64 : 88}
                paddingAngle={2}
                stroke="#fff"
                strokeWidth={2}
              >
                {pieData.map((entry, index) => (
                  <Cell key={entry.fullName} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, _name, item) => [
                  formatINR(value),
                  item?.payload?.fullName || item?.payload?.name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-medium text-gov-muted">Total</span>
            <span className="text-sm font-bold text-gov-navy">
              {formatCompactINR(summary?.totalExpenditure || pieTotal)}
            </span>
          </div>
        </div>
      </article>
    </section>
  );
}
