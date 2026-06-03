import { useEffect, useMemo, useState } from 'react';
import { ChairGrid } from '../components/ChairGrid';
import { chairApi } from '../api/chairApi';
import { serviceApi } from '../api/serviceApi';
import { customerApi } from '../api/customerApi';
import { sessionApi } from '../api/posApi';
import { Chair, Customer, Service } from '../types';
import { Alert, Badge, Btn, Card, Field, Input, PageHeader, Select } from '../components/ui';

type StepKey = 'chair' | 'customer' | 'barber' | 'service' | 'review';
const STEPS: { key: StepKey; label: string }[] = [
  { key: 'chair', label: 'Chair' },
  { key: 'customer', label: 'Customer' },
  { key: 'barber', label: 'Barber' },
  { key: 'service', label: 'Service' },
  { key: 'review', label: 'Review' }
];

function getWifi() {
  return {
    ssid: localStorage.getItem('wifi.ssid') ?? 'Knoxia-Guest',
    password: localStorage.getItem('wifi.password') ?? 'welcome123'
  };
}

function escapeHtml(s: string) {
  return String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
  ));
}

export default function POS() {
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [step, setStep] = useState<StepKey>('chair');
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const [selectedChair, setSelectedChair] = useState<Chair | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('');

  const [customerQuery, setCustomerQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error' | 'warn'; text: string } | null>(null);
  const [receipt, setReceipt] = useState<null | {
    id: string;
    customer: Customer;
    chair: Chair;
    service: Service;
    when: string;
  }>(null);

  function refresh() {
    chairApi.list().then(setChairs);
    serviceApi.list().then(setServices);
    customerApi.list().then(setCustomers);
  }
  useEffect(() => { refresh(); }, []);

  const selectedService = useMemo(
    () => services.find(s => s.id === selectedServiceId) ?? null,
    [services, selectedServiceId]
  );

  const matches = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    if (!q) return customers.slice(0, 8);
    return customers.filter(c =>
      (c.fullName ?? '').toLowerCase().includes(q) ||
      (c.phone ?? '').toLowerCase().includes(q)
    ).slice(0, 8);
  }, [customers, customerQuery]);

  const stepIndex = STEPS.findIndex(s => s.key === step);

  function go(key: StepKey) {
    setDirection(STEPS.findIndex(s => s.key === key) > stepIndex ? 'forward' : 'back');
    setMessage(null);
    setStep(key);
  }
  function next() {
    if (step === 'chair' && !selectedChair) return setMessage({ tone: 'warn', text: 'Select an empty chair.' });
    if (step === 'customer' && !selectedCustomer) return setMessage({ tone: 'warn', text: 'Select or add a customer.' });
    if (step === 'barber' && !selectedChair?.assignedBarber) return setMessage({ tone: 'warn', text: 'This chair has no assigned barber. Pick another chair.' });
    if (step === 'service' && !selectedServiceId) return setMessage({ tone: 'warn', text: 'Select a service.' });
    const i = stepIndex + 1;
    if (i < STEPS.length) go(STEPS[i].key);
  }
  function back() {
    const i = stepIndex - 1;
    if (i >= 0) go(STEPS[i].key);
  }

  function pickCustomer(c: Customer) {
    setSelectedCustomer(c);
    setCustomerQuery(c.fullName + (c.phone ? ` (${c.phone})` : ''));
    setShowDropdown(false);
  }
  function clearCustomer() { setSelectedCustomer(null); setCustomerQuery(''); }

  async function quickAddCustomer() {
    if (!newName.trim()) { setMessage({ tone: 'warn', text: 'New customer name is required.' }); return; }
    try {
      const created = await customerApi.create({ fullName: newName.trim(), phone: newPhone.trim() || undefined });
      setCustomers(prev => [...prev, created]);
      pickCustomer(created);
      setNewName(''); setNewPhone(''); setShowAdd(false); setMessage(null);
    } catch (e: any) {
      setMessage({ tone: 'error', text: 'Add customer failed: ' + (e?.response?.data?.message ?? e.message) });
    }
  }

  async function allocate() {
    if (!selectedChair || !selectedCustomer || !selectedServiceId || !selectedService || !selectedChair.assignedBarber) return;
    setBusy(true); setMessage(null);
    try {
      await sessionApi.allocate({
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.fullName,
        phone: selectedCustomer.phone,
        chairId: selectedChair.id,
        barberId: selectedChair.assignedBarber.id,
        serviceId: Number(selectedServiceId)
      });
      const id = 'KNX-' + Date.now().toString().slice(-6);
      setReceipt({
        id,
        customer: selectedCustomer,
        chair: selectedChair,
        service: selectedService,
        when: new Date().toLocaleString()
      });
      // reset wizard
      setSelectedChair(null);
      setSelectedCustomer(null);
      setSelectedServiceId('');
      setCustomerQuery('');
      setStep('chair');
      refresh();
    } catch (e: any) {
      setMessage({ tone: 'error', text: 'Allocation failed: ' + (e?.response?.data?.message ?? e.message) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="POS Allocation" subtitle="Walk through each step to seat a customer" />

      <Stepper steps={STEPS} current={step} onJump={(k) => {
        // allow jumping to any earlier step or current one
        const target = STEPS.findIndex(s => s.key === k);
        if (target <= stepIndex) go(k);
      }} />

      {message && <div className="my-4"><Alert tone={message.tone === 'success' ? 'success' : message.tone === 'error' ? 'error' : 'warn'}>{message.text}</Alert></div>}

      <div className="mt-6 relative">
        <div
          key={step}
          className={`transition-all duration-300 ${direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}
        >
          {step === 'chair' && (
            <Card title="Step 1 · Select a chair" description="Only chairs in EMPTY status can be allocated">
              <ChairGrid chairs={chairs} selectedChairId={selectedChair?.id} onSelectChair={setSelectedChair} />
            </Card>
          )}

          {step === 'customer' && (
            <Card
              title="Step 2 · Customer allocation"
              description="Search an existing customer or add a new one"
              actions={
                <Btn variant={showAdd ? 'secondary' : 'ghost'} onClick={() => setShowAdd(s => !s)}>
                  {showAdd ? 'Cancel' : '+ Add new'}
                </Btn>
              }
            >
              <Field label="Search customer">
                <div className="relative">
                  <Input
                    value={customerQuery}
                    placeholder="Name or phone…"
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                    onChange={e => { setCustomerQuery(e.target.value); setSelectedCustomer(null); setShowDropdown(true); }}
                  />
                  {showDropdown && matches.length > 0 && (
                    <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-auto">
                      {matches.map(c => (
                        <li key={c.id}>
                          <button type="button" onMouseDown={() => pickCustomer(c)}
                                  className="w-full text-left px-3 py-2 hover:bg-[#E8F0FB]">
                            <div className="text-sm font-semibold text-[#393A3D]">{c.fullName}</div>
                            <div className="text-xs text-gray-500">{c.phone ?? 'No phone'} · {c.loyaltyPoints} pts</div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Field>

              {selectedCustomer && (
                <div className="mt-3 flex items-center justify-between bg-[#E8F0FB] border border-[#BFD7F2] rounded-md px-3 py-2 text-sm">
                  <div>
                    <span className="font-semibold text-[#3A7BC2]">{selectedCustomer.fullName}</span>
                    {selectedCustomer.phone && <span className="text-gray-600"> · {selectedCustomer.phone}</span>}
                    <span className="text-gray-600"> · {selectedCustomer.loyaltyPoints} pts</span>
                  </div>
                  <button type="button" onClick={clearCustomer} className="text-xs text-red-600 hover:underline">Clear</button>
                </div>
              )}

              {showAdd && (
                <div className="mt-4 rounded-md border border-gray-200 bg-[#F4F5F8] p-4 space-y-3">
                  <Field label="Full name"><Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Jane Doe" /></Field>
                  <Field label="Phone (optional)"><Input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="097…" /></Field>
                  <Btn variant="primary" onClick={quickAddCustomer}>Save customer</Btn>
                </div>
              )}
            </Card>
          )}

          {step === 'barber' && (
            <Card title="Step 3 · Barberman" description="The barber assigned to this chair will serve the customer">
              {selectedChair?.assignedBarber ? (
                <div className="flex items-center gap-4 bg-[#F4F5F8] border border-gray-200 rounded-lg p-4">
                  <div className="w-14 h-14 rounded-full bg-[#569DE6] text-white grid place-items-center text-xl font-bold">
                    {selectedChair.assignedBarber.displayName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-semibold text-[#393A3D]">{selectedChair.assignedBarber.displayName}</div>
                    <div className="text-sm text-gray-500">{selectedChair.assignedBarber.specialty || 'General'}</div>
                  </div>
                  <Badge tone="green">Chair {selectedChair.chairNumber}</Badge>
                </div>
              ) : (
                <Alert tone="error">This chair has no assigned barber. Go back and choose a different chair.</Alert>
              )}
            </Card>
          )}

          {step === 'service' && (
            <Card title="Step 4 · Select service">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {services.map(s => {
                  const active = selectedServiceId === s.id;
                  return (
                    <button key={s.id} type="button" onClick={() => setSelectedServiceId(s.id)}
                            className={`text-left rounded-lg p-4 border transition shadow-sm
                              ${active ? 'border-[#569DE6] ring-2 ring-[#569DE6] bg-[#E8F0FB]' : 'border-gray-200 bg-white hover:border-[#569DE6]'}`}>
                      <div className="text-sm font-semibold text-[#393A3D]">{s.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{s.estimatedMinutes} min</div>
                      <div className="mt-2 text-lg font-bold text-[#569DE6]">ZMW {Number(s.price).toFixed(2)}</div>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {step === 'review' && (
            <Card title="Step 5 · Review &amp; allocate">
              <ul className="text-sm divide-y divide-gray-200">
                <Row label="Customer" value={selectedCustomer?.fullName ?? '—'} />
                <Row label="Phone" value={selectedCustomer?.phone ?? '—'} />
                <Row label="Chair" value={selectedChair ? `#${selectedChair.chairNumber} · ${selectedChair.name}` : '—'} />
                <Row label="Barber" value={selectedChair?.assignedBarber?.displayName ?? '—'} />
                <Row label="Service" value={selectedService?.name ?? '—'} />
                <Row label="Estimated time" value={selectedService ? `${selectedService.estimatedMinutes} min` : '—'} />
                <Row label="Price" value={selectedService ? `ZMW ${Number(selectedService.price).toFixed(2)}` : '—'} bold />
              </ul>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Btn variant="secondary" onClick={back} disabled={stepIndex === 0}>← Back</Btn>
        <div className="text-xs text-gray-500">Step {stepIndex + 1} of {STEPS.length}</div>
        {step !== 'review' ? (
          <Btn variant="primary" onClick={next}>Next →</Btn>
        ) : (
          <Btn variant="primary" onClick={allocate} disabled={busy}>{busy ? 'Allocating…' : 'Confirm & allocate'}</Btn>
        )}
      </div>

      {receipt && <ReceiptModal r={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <li className="flex items-center justify-between py-2.5">
      <span className="text-gray-500">{label}</span>
      <span className={`text-right ${bold ? 'text-lg font-bold text-[#569DE6]' : 'font-medium text-[#393A3D]'}`}>{value}</span>
    </li>
  );
}

function Stepper({ steps, current, onJump }: {
  steps: { key: StepKey; label: string }[];
  current: StepKey;
  onJump: (k: StepKey) => void;
}) {
  const currentIdx = steps.findIndex(s => s.key === current);
  return (
    <ol className="flex items-center gap-2">
      {steps.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <li key={s.key} className="flex items-center gap-2 flex-1">
            <button type="button" onClick={() => onJump(s.key)}
                    className={`flex items-center gap-2 flex-1 min-w-0 ${i <= currentIdx ? 'cursor-pointer' : 'cursor-default'}`}>
              <span className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold shrink-0 transition
                ${done ? 'bg-[#569DE6] text-white' : active ? 'bg-white text-[#569DE6] ring-2 ring-[#569DE6]' : 'bg-gray-200 text-gray-500'}`}>
                {done ? '✓' : i + 1}
              </span>
              <span className={`text-sm truncate ${active ? 'font-semibold text-[#393A3D]' : done ? 'text-[#393A3D]' : 'text-gray-500'}`}>
                {s.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <span className={`h-0.5 flex-1 ${i < currentIdx ? 'bg-[#569DE6]' : 'bg-gray-200'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function ReceiptModal({ r, onClose }: {
  r: { id: string; customer: Customer; chair: Chair; service: Service; when: string };
  onClose: () => void;
}) {
  const wifi = getWifi();
  function print() {
    const barber = r.chair.assignedBarber?.displayName ?? '—';
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Order ${r.id}</title>
<style>
  *{box-sizing:border-box;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#1f2937}
  body{margin:0;padding:16px;width:300px}
  h1{font-size:18px;margin:0;text-align:center;letter-spacing:1px}
  .sub{font-size:11px;text-align:center;color:#6b7280;margin-bottom:8px}
  hr{border:none;border-top:1px dashed #9ca3af;margin:10px 0}
  .row{display:flex;justify-content:space-between;font-size:12px;padding:2px 0}
  .row .k{color:#6b7280}
  .row .v{font-weight:600}
  .total{display:flex;justify-content:space-between;font-size:15px;font-weight:700;margin-top:4px}
  .wifi{border:1px solid #569DE6;background:#E8F0FB;border-radius:6px;padding:10px;text-align:center;margin-top:8px}
  .wifi .lbl{font-size:10px;font-weight:700;letter-spacing:2px;color:#3A7BC2}
  .wifi .v{font-family:monospace;font-size:13px;font-weight:700;margin-top:2px}
  .thanks{text-align:center;font-size:10px;color:#6b7280;margin-top:10px}
  @page{size:80mm auto;margin:4mm}
</style></head><body>
  <h1>KNOXIA</h1>
  <div class="sub">Salon &amp; Barbershop</div>
  <div class="row"><span class="k">Ticket</span><span class="v">${r.id}</span></div>
  <div class="row"><span class="k">Date</span><span class="v">${r.when}</span></div>
  <hr/>
  <div class="row"><span class="k">Customer</span><span class="v">${escapeHtml(r.customer.fullName)}</span></div>
  ${r.customer.phone ? `<div class="row"><span class="k">Phone</span><span class="v">${escapeHtml(r.customer.phone)}</span></div>` : ''}
  <div class="row"><span class="k">Chair #</span><span class="v">${escapeHtml(r.chair.chairNumber)} · ${escapeHtml(r.chair.name)}</span></div>
  <div class="row"><span class="k">Barberman</span><span class="v">${escapeHtml(barber)}</span></div>
  <div class="row"><span class="k">Service</span><span class="v">${escapeHtml(r.service.name)}</span></div>
  <div class="row"><span class="k">Duration</span><span class="v">${r.service.estimatedMinutes} min</span></div>
  <hr/>
  <div class="total"><span>Total</span><span>ZMW ${Number(r.service.price).toFixed(2)}</span></div>
  <div class="wifi">
    <div class="lbl">FREE WI-FI</div>
    <div class="v">SSID: ${escapeHtml(wifi.ssid)}</div>
    <div class="v">Password: ${escapeHtml(wifi.password)}</div>
  </div>
  <div class="thanks">Thank you for visiting Knoxia!</div>
  <script>window.onload=function(){window.print();setTimeout(function(){window.close()},300)}<\/script>
</body></html>`;
    const w = window.open('', '_blank', 'width=380,height=620');
    if (!w) { alert('Allow pop-ups to print the order ticket.'); return; }
    w.document.open(); w.document.write(html); w.document.close();
    onClose();
  }
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 print:bg-white print:p-0 print:static">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm print:shadow-none print:max-w-full">
        <div id="print-receipt" className="p-6 text-[#393A3D]">
          <div className="text-center">
            <div className="text-lg font-extrabold">KNOXIA</div>
            <div className="text-xs text-gray-500">Salon &amp; Barbershop</div>
          </div>
          <div className="border-t border-dashed border-gray-300 my-3" />
          <div className="text-xs text-gray-500 flex justify-between">
            <span>Ticket</span><span className="font-mono">{r.id}</span>
          </div>
          <div className="text-xs text-gray-500 flex justify-between">
            <span>Date</span><span>{r.when}</span>
          </div>
          <div className="border-t border-dashed border-gray-300 my-3" />
          <Line k="Customer" v={r.customer.fullName} />
          {r.customer.phone && <Line k="Phone" v={r.customer.phone} />}
          <Line k="Chair" v={`#${r.chair.chairNumber} · ${r.chair.name}`} />
          <Line k="Barber" v={r.chair.assignedBarber?.displayName ?? '—'} />
          <Line k="Service" v={r.service.name} />
          <Line k="Time" v={`${r.service.estimatedMinutes} min`} />
          <div className="border-t border-dashed border-gray-300 my-3" />
          <div className="flex justify-between text-base font-bold">
            <span>Total</span><span>ZMW {Number(r.service.price).toFixed(2)}</span>
          </div>
          <div className="border-t border-dashed border-gray-300 my-3" />
          <div className="rounded-md bg-[#E8F0FB] border border-[#BFD7F2] p-3 text-center">
            <div className="text-[10px] uppercase tracking-widest text-[#3A7BC2] font-bold">Free Wi-Fi</div>
            <div className="text-sm font-semibold mt-1">SSID: <span className="font-mono">{wifi.ssid}</span></div>
            <div className="text-sm font-semibold">Password: <span className="font-mono">{wifi.password}</span></div>
          </div>
          <div className="text-center text-[10px] text-gray-500 mt-3">Thank you for visiting Knoxia!</div>
        </div>
        <div className="px-5 py-3 border-t border-gray-200 bg-[#F4F5F8] flex justify-end gap-2 print:hidden">
          <Btn variant="secondary" onClick={onClose}>Close</Btn>
          <Btn variant="primary" onClick={print}>Print order</Btn>
        </div>
      </div>
    </div>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-xs py-0.5">
      <span className="text-gray-500">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
