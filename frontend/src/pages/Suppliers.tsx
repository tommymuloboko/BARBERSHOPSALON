import { useEffect, useState } from 'react';
import { supplierApi } from '../api/supplierApi';
import { Supplier } from '../types';
import { Btn, Card, Field, Input, PageHeader, TextArea } from '../components/ui';

export default function Suppliers() {
  const [items, setItems] = useState<Supplier[]>([]);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [editing, setEditing] = useState<Supplier | null>(null);

  function refresh() { supplierApi.list().then(setItems); }
  useEffect(refresh, []);

  function reset() {
    setName(''); setContact(''); setTaxId(''); setAddress(''); setNotes(''); setEditing(null);
  }

  function startEdit(s: Supplier) {
    setEditing(s);
    setName(s.name);
    setContact(s.contact ?? '');
    setTaxId(s.taxId ?? '');
    setAddress(s.address ?? '');
    setNotes(s.notes ?? '');
  }

  async function save() {
    if (!name.trim()) return;
    const payload: Partial<Supplier> = {
      name: name.trim(),
      contact: contact.trim() || undefined,
      taxId: taxId.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined
    };
    if (editing) await supplierApi.update(editing.id, payload);
    else await supplierApi.create(payload);
    reset();
    refresh();
  }

  async function remove(id: number) {
    if (!confirm('Delete this supplier?')) return;
    await supplierApi.remove(id);
    refresh();
  }

  return (
    <div>
      <PageHeader title="Suppliers" subtitle={`${items.length} supplier${items.length === 1 ? '' : 's'}`} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card title={editing ? 'Edit supplier' : 'Add supplier'}>
          <div className="space-y-3">
            <Field label="Name"><Input value={name} onChange={e => setName(e.target.value)} placeholder="Acme Trading Ltd" /></Field>
            <Field label="Contact"><Input value={contact} onChange={e => setContact(e.target.value)} placeholder="Phone / email" /></Field>
            <Field label="TPIN / VAT #"><Input value={taxId} onChange={e => setTaxId(e.target.value)} placeholder="Tax ID" /></Field>
            <Field label="Address"><Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, city" /></Field>
            <Field label="Notes"><TextArea rows={3} value={notes} onChange={e => setNotes(e.target.value)} /></Field>
            <div className="flex gap-2">
              <Btn variant="primary" className="flex-1" onClick={save}>{editing ? 'Save changes' : 'Add supplier'}</Btn>
              {editing && <Btn variant="secondary" onClick={reset}>Cancel</Btn>}
            </div>
          </div>
        </Card>

        <div className="xl:col-span-2">
          <Card title="Supplier list">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">Contact</th>
                  <th className="py-2">TPIN / VAT</th>
                  <th className="py-2">Address</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(s => (
                  <tr key={s.id} className="border-t border-gray-100">
                    <td className="py-2.5 font-medium text-[#393A3D]">{s.name}</td>
                    <td className="py-2.5 text-gray-600">{s.contact ?? '—'}</td>
                    <td className="py-2.5 text-gray-600">{s.taxId ?? '—'}</td>
                    <td className="py-2.5 text-gray-600">{s.address ?? '—'}</td>
                    <td className="py-2.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Btn variant="ghost" onClick={() => startEdit(s)}>Edit</Btn>
                        <Btn variant="ghost" onClick={() => remove(s.id)}>Delete</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={5} className="py-4 text-center text-sm text-gray-500">No suppliers yet.</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
}
