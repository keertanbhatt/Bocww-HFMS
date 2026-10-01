import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCompactINR, formatINR } from '../utils/formatINR';

function Panel({ title, subtitle, children, className = '' }) {
  return (
    <article className={`hfms-card flex flex-col p-5 ${className}`}>
      <h3 className="text-sm font-bold text-gov-navy">{title}</h3>
      {subtitle ? <p className="mt-0.5 text-xs text-gov-muted">{subtitle}</p> : null}
      <div className="mt-4 min-h-0 flex-1">{children}</div>
    </article>
  );
}

export default function DashboardExtendedPanels({ analytics, chartData }) {
  if (!analytics) return null;

  const taxChart = chartData?.taxComponents?.length
    ? chartData.taxComponents
    : analytics.taxes
      ? [
          { name: 'TDS', value: analytics.taxes.tds },
          { name: 'CGST', value: analytics.taxes.cgst },
          { name: 'SGST', value: analytics.taxes.sgst },
          { name: 'IGST', value: analytics.taxes.igst },
        ].filter((t) => t.value > 0)
      : [];

  const tiers = analytics.tierCounts;
  const banks = analytics.bankBalances || [];
  const vouchers = analytics.vouchers;
  const top = analytics.expenditureRange;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-12">
        <Panel
          title="Tax & deductions (Sheet1)"
          subtitle="TDS and GST totals across all schemes"
          className="lg:col-span-4"
        >
          {taxChart.length ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taxChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => formatCompactINR(v)} width={72} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => formatINR(v)} />
                  <Bar dataKey="value" fill="#1d3d7d" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gov-muted">No tax columns in imported summaries.</p>
          )}
          {analytics.taxes ? (
            <p className="mt-2 text-xs text-gov-muted">
              Combined tax/deductions:{' '}
              <span className="font-semibold text-gov-navy">
                {formatINR(analytics.taxes.combined)}
              </span>
            </p>
          ) : null}
        </Panel>

        <Panel
          title="Spend tiers (by lakhs)"
          subtitle="From Excel in_lakhs on each scheme"
          className="lg:col-span-3"
        >
          {tiers ? (
            <ul className="space-y-3 text-sm">
              {[
                { label: 'High (≥ 500 L)', count: tiers.high, color: 'bg-orange-500' },
                { label: 'Moderate (50–500 L)', count: tiers.moderate, color: 'bg-emerald-500' },
                { label: 'Normal (< 50 L)', count: tiers.normal, color: 'bg-blue-500' },
                { label: 'No expenditure', count: tiers.zero, color: 'bg-slate-300' },
              ].map((row) => (
                <li key={row.label} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-gov-text">
                    <span className={`h-2.5 w-2.5 rounded-full ${row.color}`} />
                    {row.label}
                  </span>
                  <span className="font-bold tabular-nums text-gov-navy">{row.count}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {top?.topSchemeName ? (
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-gov-muted">
              Highest:{' '}
              <span className="font-medium text-gov-navy">{top.topSchemeName.slice(0, 40)}</span>
              <br />
              {formatINR(top.topSchemeAmount)}
            </p>
          ) : null}
        </Panel>

        <Panel
          title="Bank balances (Excel)"
          subtitle="bank balance + gsfs sheet"
          className="lg:col-span-5"
        >
          {banks.length ? (
            <ul className="max-h-52 space-y-2 overflow-y-auto pr-1 text-xs">
              {banks.map((b, i) => (
                <li
                  key={`${b.bankName}-${b.accountNumber}-${i}`}
                  className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-gov-navy">
                      {b.bankName || 'Bank'}
                    </span>
                    <span className="text-gov-muted">
                      {b.accountNumber || '—'}
                      {b.rowType ? ` · ${b.rowType}` : ''}
                    </span>
                  </span>
                  <span className="shrink-0 font-bold tabular-nums text-gov-saffron">
                    {Number(b.balanceCrores).toFixed(4)} Cr
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gov-muted">
              No bank snapshot rows imported. Re-import workbook to load bank sheet.
            </p>
          )}
        </Panel>
      </div>

      {vouchers?.hasData ? (
        <Panel title="Voucher transactions (detail sheets)" subtitle="Main / 2025-2026 rows in DB">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {[
              { label: 'Transactions', value: String(vouchers.transactionCount) },
              { label: 'Total debit', value: formatCompactINR(vouchers.totalDebit) },
              { label: 'Beneficiaries', value: String(vouchers.totalBeneficiaries) },
              { label: 'Voucher TDS', value: formatCompactINR(vouchers.voucherTds) },
              { label: 'Security deposit', value: formatCompactINR(vouchers.securityDeposit) },
              { label: 'Labour cess', value: formatCompactINR(vouchers.laborCess) },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-[10px] uppercase text-gov-muted">{item.label}</p>
                <p className="text-sm font-bold text-gov-navy">{item.value}</p>
              </div>
            ))}
          </div>
          {vouchers.earliestDate && vouchers.latestDate ? (
            <p className="mt-3 text-xs text-gov-muted">
              Date range: {String(vouchers.earliestDate).slice(0, 10)} →{' '}
              {String(vouchers.latestDate).slice(0, 10)}
            </p>
          ) : null}
        </Panel>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white/80 px-4 py-3 text-sm text-gov-muted">
          Voucher-level rows are not loaded (large Excel). Dashboard uses Sheet1 scheme summaries;
          import with vouchers enabled when you need transaction-level totals here.
        </div>
      )}
    </div>
  );
}
