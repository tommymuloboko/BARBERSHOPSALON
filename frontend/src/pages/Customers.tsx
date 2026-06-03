import { useEffect, useMemo, useState } from 'react';
import { customerApi } from '../api/customerApi';
import { Customer } from '../types';
import { Btn, Card, Field, Input, PageHeader } from '../components/ui';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [query, setQuery] = useState('');

  function refresh() { customerApi.list().then(setCustomers); }
  useEffect(refresh, []);

  async function add() {
    if (!name || !phone) return;
    await customerApi.create({ fullName: name, phone });
    setName(''); setPhone('');
    refresh();
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(c =>
      c.fullName.toLowerCase().includes(q) || (c.phone ?? '').toLowerCase().includes(q));
  }, [customers, query]);

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${customers.length} customer${customers.length === 1 ? '' : 's'} on file`} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card title="Add customer">
          <div className="space-y-3">
            <Field label="Full name"><Input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" /></Field>
            <Field label="Phone"><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="097…" /></Field>
            <Btn variant="primary" className="w-full" onClick={add}>Add customer</Btn>
          </div>
        </Card>

        <div className="xl:col-span-2">
          <Card
            title="Customer list"
            actions={<Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" className="!w-56" />}
          >
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">Phone</th>
                  <th className="py-2 text-right">Loyalty</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-t border-gray-100">
                    <td className="py-2.5 font-medium text-[#393A3D]">{c.fullName}</td>
                    <td className="py-2.5 text-gray-600">{c.phone ?? '—'}</td>
                    <td className="py-2.5 text-right font-semibold text-[#569DE6]">{c.loyaltyPoints} pts</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={3} className="py-4 text-center text-sm text-gray-500">No customers.</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
}
