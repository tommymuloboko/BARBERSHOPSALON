import { useEffect, useMemo, useState } from 'react';
import { reportApi } from '../api/posApi';
import { Badge, Btn, Card, Field, Input, PageHeader, Select } from '../components/ui';

type Tab = 'daily' | 'weekly' | 'monthly' | 'custom' | 'eod';

type Summary = {
  kind: string;
  from: string;
  to: string;
  date: string;
  transactions: number;
  customers: number;
  totalRevenue: number | string;
  totalExpenses: number | string;
  net: number | string;
  salesLessThanExpenses: boolean;
  byMethod: Record<string, number | string>;
  byBarber: Array<{ barberId: number | null; name: string; count: number; revenue: number | string }>;
  byDay: Array<{ date: string; revenue: number | string; customers: number }>;
  topServices: Record<string, number>;
  expensesByCategory: Record<string, number | string>;
  paidCount?: number;
  pendingCount?: number;
  refundedCount?: number;
  expectedCashOnHand?: number | string;
};

const today = () => new Date().toISOString().slice(0, 10);
const fmt = (v: number | string | undefined) => `ZMW ${Number(v ?? 0).toFixed(2)}`;

export default function Reports() {
  const [tab, setTab] = useState<Tab>('daily');
  const [date, setDate] = useState<string>(today());
  const [from, setFrom] = useState<string>(today());
  const [to, setTo] = useState<string>(today());
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>('');

  async function load() {
    setLoading(true);
    setErr('');
    try {
      let r: Summary;
      if (tab === 'daily') r = await reportApi.daily(date);
      else if (tab === 'weekly') r = await reportApi.weekly(date);
      else if (tab === 'monthly') r = await reportApi.monthly(date);
      else if (tab === 'eod') r = await reportApi.endOfDay(date);
      else r = await reportApi.range(from, to);
      setData(r);
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to load');
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [tab]);

  const title = useMemo(() => ({
    daily: 'Daily Sales Report',
    weekly: 'Weekly Sales Report',
    monthly: 'Monthly Sales Report',
    custom: 'Custom Range Report',
    eod: 'End of Day Report'
  }[tab]), [tab]);

  const subtitle = data ? (data.from === data.to ? data.from : `${data.from} → ${data.to}`) : '';

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <div className="flex flex-wrap gap-2">
            {(['daily', 'weekly', 'monthly', 'custom', 'eod'] as Tab[]).map(t => (
              <Btn key={t} variant={tab === t ? 'primary' : 'secondary'} onClick={() => setTab(t)}>
                {t === 'eod' ? 'End of Day' : t[0].toUpperCase() + t.slice(1)}
              </Btn>
            ))}
          </div>
        }
      />

      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-3">
          {tab !== 'custom' ? (
            <Field label={tab === 'weekly' ? 'Any date in week' : tab === 'monthly' ? 'Any date in month' : 'Date'}>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </Field>
          ) : (
            <>
              <Field label="From"><Input type="date" value={from} onChange={e => setFrom(e.target.value)} /></Field>
              <Field label="To"><Input type="date" value={to} onChange={e => setTo(e.target.value)} /></Field>
            </>
          )}
          <Btn onClick={load}>Apply filter</Btn>
          <Btn variant="secondary" onClick={() => window.print()}>Print</Btn>
        </div>
      </Card>

      {err && <Card className="mb-4"><div className="text-sm text-red-600">{err}</div></Card>}
      {loading && !data && <Card><div className="text-sm text-gray-500">Loading…</div></Card>}

      {data && (
        <>
          {data.salesLessThanExpenses && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <strong>Heads up:</strong> Sales ({fmt(data.totalRevenue)}) are less than Expenses ({fmt(data.totalExpenses)}). Net: {fmt(data.net)}.
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Stat label="Total revenue" value={fmt(data.totalRevenue)} accent="border-l-[#569DE6]" />
            <Stat label="Total expenses" value={fmt(data.totalExpenses)} accent="border-l-amber-500" />
            <Stat label="Net" value={fmt(data.net)} accent={Number(data.net) >= 0 ? 'border-l-emerald-500' : 'border-l-red-500'} />
            <Stat label="Transactions" value={String(data.transactions)} accent="border-l-[#393A3D]" />
          </div>

          {tab === 'eod' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Stat label="Paid sales" value={String(data.paidCount ?? 0)} accent="border-l-emerald-500" />
              <Stat label="Pending sales" value={String(data.pendingCount ?? 0)} accent="border-l-amber-500" />
              <Stat label="Refunded" value={String(data.refundedCount ?? 0)} accent="border-l-red-500" />
              <Stat label="Expected cash on hand" value={fmt(data.expectedCashOnHand)} accent="border-l-[#569DE6]" />
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card title="Sales by payment type">
              <ul className="divide-y divide-gray-100 text-sm">
                {Object.entries(data.byMethod).map(([m, v]) => (
                  <li key={m} className="flex items-center justify-between py-2">
                    <span className="text-gray-600">
                      <Badge tone={m === 'CASH' ? 'green' : m === 'CARD' ? 'blue' : 'amber'}>{m.replace('_', ' ')}</Badge>
                    </span>
                    <span className="font-semibold">{fmt(v)}</span>
                  </li>
                ))}
                {Object.keys(data.byMethod).length === 0 && <li className="py-2 text-gray-500">No data.</li>}
              </ul>
            </Card>

            <Card title="Sales by barber">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2">Barber</th>
                    <th className="py-2 text-right">Sales</th>
                    <th className="py-2 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.byBarber.map(b => (
                    <tr key={b.barberId ?? 'unassigned'}>
                      <td className="py-2">{b.name}</td>
                      <td className="py-2 text-right">{b.count}</td>
                      <td className="py-2 text-right font-semibold">{fmt(b.revenue)}</td>
                    </tr>
                  ))}
                  {data.byBarber.length === 0 && <tr><td colSpan={3} className="py-3 text-gray-500">No data.</td></tr>}
                </tbody>
              </table>
            </Card>

            {(tab === 'weekly' || tab === 'monthly' || tab === 'custom') && (
              <Card title="Sales per day" className="xl:col-span-2">
                <DailyBar rows={data.byDay} />
              </Card>
            )}

            <Card title="Top services">
              <ul className="divide-y divide-gray-100 text-sm">
                {Object.entries(data.topServices).map(([n, c]) => (
                  <li key={n} className="flex justify-between py-2">
                    <span>{n}</span>
                    <span className="font-semibold text-[#569DE6]">{c}</span>
                  </li>
                ))}
                {Object.keys(data.topServices).length === 0 && <li className="py-2 text-gray-500">No data.</li>}
              </ul>
            </Card>

            <Card title="Expenses by category">
              <ul className="divide-y divide-gray-100 text-sm">
                {Object.entries(data.expensesByCategory).map(([cat, v]) => (
                  <li key={cat} className="flex justify-between py-2">
                    <span>{cat}</span>
                    <span className="font-semibold text-amber-600">{fmt(v)}</span>
                  </li>
                ))}
                {Object.keys(data.expensesByCategory).length === 0 && <li className="py-2 text-gray-500">No expenses.</li>}
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className={`bg-white border border-gray-200 border-l-4 ${accent} rounded-lg shadow-sm px-4 py-3`}>
      <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-semibold text-[#393A3D] mt-1">{value}</div>
    </div>
  );
}

function DailyBar({ rows }: { rows: Array<{ date: string; revenue: number | string; customers: number }> }) {
  const max = Math.max(1, ...rows.map(r => Number(r.revenue)));
  return (
    <div className="space-y-2">
      {rows.map(r => {
        const pct = (Number(r.revenue) / max) * 100;
        return (
          <div key={r.date} className="flex items-center gap-3 text-sm">
            <div className="w-24 text-gray-500">{r.date}</div>
            <div className="flex-1 bg-gray-100 rounded h-5 relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-[#569DE6]" style={{ width: `${pct}%` }} />
            </div>
            <div className="w-32 text-right font-semibold">ZMW {Number(r.revenue).toFixed(2)}</div>
            <div className="w-16 text-right text-gray-500">{r.customers} cust.</div>
          </div>
        );
      })}
      {rows.length === 0 && <div className="text-gray-500">No data.</div>}
    </div>
  );
}
