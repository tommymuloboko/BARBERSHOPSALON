import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { inventoryApi } from '../api/inventoryApi';
import { supplierApi } from '../api/supplierApi';
import { InventoryItem, ItemClass, Supplier } from '../types';
import { Btn, Card, Field, Input, PageHeader, Badge, Select } from '../components/ui';

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [query, setQuery] = useState('');
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('');
  const [quantity, setQuantity] = useState('0');
  const [reorderLevel, setReorderLevel] = useState('0');
  const [unitCost, setUnitCost] = useState('0');
  const [itemClass, setItemClass] = useState<ItemClass>('RESELL');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [supplierTaxId, setSupplierTaxId] = useState('');
  const [vatAmount, setVatAmount] = useState('0');
  const [poNumber, setPoNumber] = useState('');

  function refresh() {
    inventoryApi.list().then(setItems);
    supplierApi.list().then(setSuppliers);
  }
  useEffect(refresh, []);

  function onPickSupplier(idStr: string) {
    setSupplierId(idStr);
    if (!idStr) return;
    const s = suppliers.find(x => String(x.id) === idStr);
    if (s) {
      setSupplierName(s.name);
      setSupplierContact(s.contact ?? '');
      setSupplierTaxId(s.taxId ?? '');
    }
  }

  async function add() {
    if (!name.trim()) return;
    await inventoryApi.create({
      name: name.trim(),
      sku: sku.trim() || undefined,
      unit: unit.trim() || undefined,
      quantity: Number(quantity) || 0,
      reorderLevel: Number(reorderLevel) || 0,
      unitCost: Number(unitCost) || 0,
      itemClass,
      invoiceNumber: invoiceNumber.trim() || undefined,
      invoiceDate: invoiceDate || undefined,
      supplierName: supplierName.trim() || undefined,
      supplierContact: supplierContact.trim() || undefined,
      supplierTaxId: supplierTaxId.trim() || undefined,
      vatAmount: Number(vatAmount) || 0,
      poNumber: poNumber.trim() || undefined
    });
    setName(''); setSku(''); setUnit(''); setQuantity('0'); setReorderLevel('0'); setUnitCost('0');
    setItemClass('RESELL');
    setInvoiceNumber(''); setInvoiceDate(''); setSupplierId(''); setSupplierName('');
    setSupplierContact(''); setSupplierTaxId(''); setVatAmount('0'); setPoNumber('');
    refresh();
  }

  async function adjust(item: InventoryItem, delta: number) {
    const next = Math.max(0, (item.quantity || 0) + delta);
    await inventoryApi.update(item.id, { quantity: next });
    refresh();
  }

  async function remove(id: number) {
    if (!confirm('Delete this item?')) return;
    await inventoryApi.remove(id);
    refresh();
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.sku ?? '').toLowerCase().includes(q));
  }, [items, query]);

  const totals = useMemo(() => {
    const totalValue = items.reduce((s, i) => s + Number(i.quantity || 0) * Number(i.unitCost || 0), 0);
    const lowStock = items.filter(i => Number(i.quantity || 0) <= Number(i.reorderLevel || 0)).length;
    return { totalValue, lowStock };
  }, [items]);

  return (
    <div>
      <PageHeader title="Inventory" subtitle={`${items.length} item${items.length === 1 ? '' : 's'} • ${totals.lowStock} low stock`} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card title="Add item">
          <div className="space-y-3">
            <Field label="Name"><Input value={name} onChange={e => setName(e.target.value)} placeholder="Hair pomade" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="SKU"><Input value={sku} onChange={e => setSku(e.target.value)} placeholder="POM-001" /></Field>
              <Field label="Unit"><Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="bottle" /></Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Qty"><Input type="number" min="0" value={quantity} onChange={e => setQuantity(e.target.value)} /></Field>
              <Field label="Reorder"><Input type="number" min="0" value={reorderLevel} onChange={e => setReorderLevel(e.target.value)} /></Field>
              <Field label="Cost"><Input type="number" min="0" step="0.01" value={unitCost} onChange={e => setUnitCost(e.target.value)} /></Field>
            </div>
            <Field label="Item class">
              <Select value={itemClass} onChange={e => setItemClass(e.target.value as ItemClass)}>
                <option value="RESELL">Resell — for sale to customers</option>
                <option value="USE">Use — used in the shop</option>
              </Select>
            </Field>
            <div className="pt-2 border-t border-gray-100" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Invoice #"><Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="INV-001" /></Field>
              <Field label="Invoice date"><Input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="PO #"><Input value={poNumber} onChange={e => setPoNumber(e.target.value)} placeholder="PO-001" /></Field>
              <Field label="VAT"><Input type="number" min="0" step="0.01" value={vatAmount} onChange={e => setVatAmount(e.target.value)} /></Field>
            </div>
            <Field label="Supplier">
              <div className="flex gap-2">
                <Select value={supplierId} onChange={e => onPickSupplier(e.target.value)} className="flex-1">
                  <option value="">— Select supplier —</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
                <Link to="/suppliers"><Btn variant="secondary" type="button">Manage</Btn></Link>
              </div>
            </Field>
            <Field label="Supplier name"><Input value={supplierName} onChange={e => { setSupplierName(e.target.value); setSupplierId(''); }} placeholder="Supplier name" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Supplier contact"><Input value={supplierContact} onChange={e => setSupplierContact(e.target.value)} placeholder="Phone / email" /></Field>
              <Field label="Supplier TPIN/VAT"><Input value={supplierTaxId} onChange={e => setSupplierTaxId(e.target.value)} placeholder="Tax ID" /></Field>
            </div>
            <Btn variant="primary" className="w-full" onClick={add}>Add item</Btn>
          </div>
        </Card>

        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card><div className="text-xs text-gray-500 uppercase">Total stock value</div><div className="text-2xl font-bold text-[#569DE6]">ZMW {totals.totalValue.toFixed(2)}</div></Card>
            <Card><div className="text-xs text-gray-500 uppercase">Low stock</div><div className="text-2xl font-bold text-[#393A3D]">{totals.lowStock}</div></Card>
          </div>

          <Card
            title="Stock list"
            actions={<Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" className="!w-56" />}
          >
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="py-2">Item</th>
                  <th className="py-2">SKU</th>
                  <th className="py-2">Class</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Cost</th>
                  <th className="py-2 text-right">Value</th>
                  <th className="py-2 text-right">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(i => {
                  const low = Number(i.quantity || 0) <= Number(i.reorderLevel || 0);
                  return (
                    <tr key={i.id} className="border-t border-gray-100">
                      <td className="py-2.5 font-medium text-[#393A3D]">{i.name}{i.unit ? <span className="text-gray-400 text-xs"> / {i.unit}</span> : null}</td>
                      <td className="py-2.5 text-gray-600">{i.sku ?? '—'}</td>
                      <td className="py-2.5">
                        {i.itemClass === 'USE'
                          ? <Badge tone="amber">Use</Badge>
                          : <Badge tone="blue">Resell</Badge>}
                      </td>
                      <td className="py-2.5 text-right font-semibold">{i.quantity}</td>
                      <td className="py-2.5 text-right text-gray-600">ZMW {Number(i.unitCost).toFixed(2)}</td>
                      <td className="py-2.5 text-right text-gray-600">ZMW {(Number(i.quantity || 0) * Number(i.unitCost || 0)).toFixed(2)}</td>
                      <td className="py-2.5 text-right">
                        {low ? <Badge tone="red">Low</Badge> : <Badge tone="green">OK</Badge>}
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Btn variant="ghost" onClick={() => adjust(i, -1)}>−</Btn>
                          <Btn variant="ghost" onClick={() => adjust(i, +1)}>+</Btn>
                          <Btn variant="ghost" onClick={() => remove(i.id)}>Delete</Btn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="py-4 text-center text-sm text-gray-500">No items.</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
}
