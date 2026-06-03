import { useEffect, useMemo, useState } from 'react';
import { expenseApi } from '../api/expenseApi';
import { Expense } from '../types';
import { Btn, Card, Field, Input, PageHeader, Select } from '../components/ui';

const CATEGORIES = ['Rent', 'Utilities', 'Supplies', 'Salaries', 'Maintenance', 'Marketing', 'Other'];

function today() { return new Date().toISOString().slice(0, 10); }

export default function Expenses() {
  const [items, setItems] = useState<Expense[]>([]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('0');
  const [expenseDate, setExpenseDate] = useState(today());
  const [query, setQuery] = useState('');

  function refresh() { expenseApi.list().then(setItems); }
  useEffect(refresh, []);

  async function add() {
    if (!category || Number(amount) <= 0) return;
    await expenseApi.create({
      category,
      description: description.trim() || undefined,
      amount: Number(amount),
      expenseDate
    });
    setDescription(''); setAmount('0'); setExpenseDate(today());
    refresh();
  }

  async function remove(id: number) {
    if (!confirm('Delete this expense?')) return;
    await expenseApi.remove(id);
    refresh();
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...items].sort((a, b) => (b.expenseDate || '').localeCompare(a.expenseDate || ''));
    if (!q) return sorted;
    return sorted.filter(e =>
      e.category.toLowerCase().includes(q) ||
      (e.description ?? '').toLowerCase().includes(q));
  }, [items, query]);

  const totals = useMemo(() => {
    const total = items.reduce((s, e) => s + Number(e.amount || 0), 0);
    const month = today().slice(0, 7);
    const monthTotal = items.filter(e => (e.expenseDate || '').startsWith(month))
      .reduce((s, e) => s + Number(e.amount || 0), 0);
    return { total, monthTotal };
  }, [items]);

  return (
    <div>
      <PageHeader title="Expenses" subtitle={`${items.length} entr${items.length === 1 ? 'y' : 'ies'}`} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card title="Record expense">
          <div className="space-y-3">
            <Field label="Category">
              <Select value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Description"><Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional note" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Amount (ZMW)"><Input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} /></Field>
              <Field label="Date"><Input type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} /></Field>
            </div>
            <Btn variant="primary" className="w-full" onClick={add}>Add expense</Btn>
          </div>
        </Card>

        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card><div className="text-xs text-gray-500 uppercase">Total expenses</div><div className="text-2xl font-bold text-[#569DE6]">ZMW {totals.total.toFixed(2)}</div></Card>
            <Card><div className="text-xs text-gray-500 uppercase">This month</div><div className="text-2xl font-bold text-[#393A3D]">ZMW {totals.monthTotal.toFixed(2)}</div></Card>
          </div>

          <Card
            title="Expense log"
            actions={<Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" className="!w-56" />}
          >
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="py-2">Date</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Amount</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id} className="border-t border-gray-100">
                    <td className="py-2.5 text-gray-600">{e.expenseDate}</td>
                    <td className="py-2.5 font-medium text-[#393A3D]">{e.category}</td>
                    <td className="py-2.5 text-gray-600">{e.description ?? '—'}</td>
                    <td className="py-2.5 text-right font-semibold text-[#569DE6]">ZMW {Number(e.amount).toFixed(2)}</td>
                    <td className="py-2.5 text-right">
                      <Btn variant="ghost" onClick={() => remove(e.id)}>Delete</Btn>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="py-4 text-center text-sm text-gray-500">No expenses.</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
}
