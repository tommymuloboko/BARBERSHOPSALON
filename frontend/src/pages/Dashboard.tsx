import { useEffect, useState } from 'react';
import { chairApi } from '../api/chairApi';
import { barberApi } from '../api/barberApi';
import { saleApi } from '../api/posApi';
import { Chair, Barber, Sale } from '../types';
import { Badge, Card, PageHeader } from '../components/ui';

export default function Dashboard() {
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    chairApi.list().then(d => setChairs(Array.isArray(d) ? d : [])).catch(() => setChairs([]));
    barberApi.list().then(d => setBarbers(Array.isArray(d) ? d : [])).catch(() => setBarbers([]));
    saleApi.today().then(d => setSales(Array.isArray(d) ? d : [])).catch(() => setSales([]));
  }, []);

  const empty = chairs.filter(c => c.status === 'EMPTY').length;
  const occupied = chairs.filter(c => c.status === 'OCCUPIED').length;
  const available = barbers.filter(b => b.status === 'AVAILABLE').length;
  const revenue = sales.filter(s => s.paymentStatus === 'PAID').reduce((sum, s) => sum + Number(s.total), 0);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of today's salon activity" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat label="Empty chairs" value={empty} tone="green" />
        <Stat label="Occupied chairs" value={occupied} tone="red" />
        <Stat label="Available barbers" value={available} tone="blue" />
        <Stat label="Today revenue (ZMW)" value={revenue.toFixed(2)} tone="dark" />
      </div>

      <Card title="Today's sales" description="Most recent transactions">
        {sales.length === 0 && <p className="text-sm text-gray-500">No sales yet.</p>}
        {sales.length > 0 && (
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="py-2">Sale</th>
                <th className="py-2">Customer</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(s => (
                <tr key={s.id} className="border-t border-gray-100">
                  <td className="py-2.5 text-gray-600">#{s.id}</td>
                  <td className="py-2.5">{s.customer?.fullName}</td>
                  <td className="py-2.5">
                    <Badge tone={s.paymentStatus === 'PAID' ? 'green' : s.paymentStatus === 'PENDING' ? 'amber' : 'gray'}>
                      {s.paymentStatus}
                    </Badge>
                  </td>
                  <td className="py-2.5 text-right font-semibold">ZMW {Number(s.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone: 'green' | 'red' | 'blue' | 'dark' }) {
  const accent = {
    green: 'border-l-[#569DE6]',
    red: 'border-l-red-400',
    blue: 'border-l-blue-400',
    dark: 'border-l-[#393A3D]'
  }[tone];
  return (
    <div className={`bg-white border border-gray-200 border-l-4 ${accent} rounded-lg shadow-sm px-4 py-3`}>
      <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-semibold text-[#393A3D] mt-1">{value}</div>
    </div>
  );
}
