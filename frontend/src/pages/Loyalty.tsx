import { useEffect, useMemo, useState } from 'react';
import { customerApi } from '../api/customerApi';
import { Customer } from '../types';
import { Badge, Card, Input, PageHeader } from '../components/ui';

const VISITS_REQUIRED = 5;
const REWARD_DISCOUNT = 30;

export default function Loyalty() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => { customerApi.list().then(setCustomers); }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? customers.filter(c =>
          c.fullName.toLowerCase().includes(q) || (c.phone ?? '').toLowerCase().includes(q))
      : customers;
    return list.map(c => {
      const visits = c.loyaltyPoints ?? 0;
      const eligible = visits >= VISITS_REQUIRED;
      const progress = eligible ? 100 : Math.round((visits / VISITS_REQUIRED) * 100);
      return { c, visits, eligible, progress };
    });
  }, [customers, query]);

  const eligibleCount = rows.filter(r => r.eligible).length;

  return (
    <div>
      <PageHeader
        title="Loyalty"
        subtitle={`After ${VISITS_REQUIRED} visits, the next visit earns ${REWARD_DISCOUNT}% off — then counting resets.`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card><div className="text-xs text-gray-500 uppercase">Customers</div><div className="text-2xl font-bold text-[#393A3D]">{customers.length}</div></Card>
        <Card><div className="text-xs text-gray-500 uppercase">Eligible for reward</div><div className="text-2xl font-bold text-[#569DE6]">{eligibleCount}</div></Card>
        <Card><div className="text-xs text-gray-500 uppercase">Reward</div><div className="text-2xl font-bold text-[#393A3D]">{REWARD_DISCOUNT}% off</div></Card>
      </div>

      <Card
        title="Loyalty status"
        actions={<Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" className="!w-56" />}
      >
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="py-2">Customer</th>
              <th className="py-2">Phone</th>
              <th className="py-2">Progress</th>
              <th className="py-2 text-right">Visits</th>
              <th className="py-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ c, visits, eligible, progress }) => (
              <tr key={c.id} className="border-t border-gray-100">
                <td className="py-2.5 font-medium text-[#393A3D]">{c.fullName}</td>
                <td className="py-2.5 text-gray-600">{c.phone ?? '—'}</td>
                <td className="py-2.5 w-64">
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full ${eligible ? 'bg-[#569DE6]' : 'bg-[#569DE6]/60'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </td>
                <td className="py-2.5 text-right font-semibold text-[#569DE6]">
                  {Math.min(visits, VISITS_REQUIRED)} / {VISITS_REQUIRED}
                </td>
                <td className="py-2.5 text-right">
                  {eligible
                    ? <Badge tone="green">{REWARD_DISCOUNT}% off next visit</Badge>
                    : <Badge tone="gray">{VISITS_REQUIRED - visits} to go</Badge>}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="py-4 text-center text-sm text-gray-500">No customers.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
