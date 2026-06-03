import { useEffect, useMemo, useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../api/bookingApi';
import { customerApi } from '../api/customerApi';
import { serviceApi } from '../api/serviceApi';
import { barberApi } from '../api/barberApi';
import { Booking, Service, Barber } from '../types';
import { Alert, Btn, Card, Field, Input, PageHeader, Select } from '../components/ui';

const DAY_START_MIN = 8 * 60;
const DAY_END_MIN = 20 * 60;
const SLOT_MIN = 30;
const SLOT_PX = 48;
const HEADER_PX = 44;

function toMin(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}
function fmt(min: number) {
  const h = Math.floor(min / 60).toString().padStart(2, '0');
  const m = (min % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}
function addDays(iso: string, delta: number) {
  const d = new Date(iso); d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}
function statusColor(s: Booking['status']) {
  switch (s) {
    case 'CONFIRMED':  return 'bg-blue-100 border-blue-300 text-blue-900';
    case 'CHECKED_IN': return 'bg-emerald-100 border-emerald-300 text-emerald-900';
    case 'COMPLETED':  return 'bg-gray-100 border-gray-300 text-gray-700';
    case 'CANCELLED':
    case 'NO_SHOW':    return 'bg-rose-100 border-rose-300 text-rose-900 line-through';
    default:           return 'bg-amber-100 border-amber-300 text-amber-900';
  }
}

export default function Bookings() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [message, setMessage] = useState<{ tone: 'success' | 'error' | 'warn'; text: string } | null>(null);
  const [selected, setSelected] = useState<Booking | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [serviceId, setServiceId] = useState<number | ''>('');
  const [barberId, setBarberId] = useState<number | ''>('');

  function flash(tone: 'success' | 'error' | 'warn', text: string) {
    setMessage({ tone, text });
    setTimeout(() => setMessage(null), 2500);
  }
  function refresh() {
    bookingApi.byDate(date).then(setBookings).catch(() => setBookings([]));
  }
  useEffect(() => {
    serviceApi.list().then(setServices);
    barberApi.list().then(setBarbers);
  }, []);
  useEffect(refresh, [date]);

  const slots = useMemo(() => {
    const out: number[] = [];
    for (let m = DAY_START_MIN; m < DAY_END_MIN; m += SLOT_MIN) out.push(m);
    return out;
  }, []);

  const columns = useMemo<(Barber | null)[]>(() => [null, ...barbers], [barbers]);

  function openNew(barber: Barber | null, time: string) {
    setBarberId(barber ? barber.id : '');
    setStartTime(time);
    setCustomerName('');
    setPhone('');
    setServiceId(services[0]?.id ?? '');
    setSelected(null);
    setModalOpen(true);
  }

  async function createBooking() {
    if (!customerName.trim() || !phone.trim() || !serviceId) {
      flash('warn', 'Customer, phone and service are required.'); return;
    }
    try {
      const found = await customerApi.search(phone.trim());
      const customer = found[0] ?? await customerApi.create({ fullName: customerName.trim(), phone: phone.trim() });
      await bookingApi.create({
        customer: { id: customer.id },
        barber: barberId ? { id: barberId } : null,
        service: { id: serviceId },
        bookingDate: date,
        startTime
      });
      setModalOpen(false);
      flash('success', 'Booking created.');
      refresh();
    } catch (e: any) {
      flash('error', 'Failed: ' + (e?.response?.data?.message ?? e.message));
    }
  }

  async function act(b: Booking, fn: (id: number) => Promise<unknown>, msg: string) {
    try { await fn(b.id); flash('success', msg); setSelected(null); refresh(); }
    catch (e: any) { flash('error', e?.response?.data?.message ?? e.message); }
  }

  function durationFor(b: Booking) {
    const svc = services.find(s => s.id === b.service?.id);
    return svc?.estimatedMinutes ?? 30;
  }
  function bookingsFor(barber: Barber | null) {
    return bookings.filter(b => (b.barber?.id ?? null) === (barber?.id ?? null));
  }

  const totalHeight = slots.length * SLOT_PX + HEADER_PX;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <PageHeader
        title="Bookings"
        subtitle="Daily calendar by staff"
        actions={
          <div className="flex items-center gap-2">
            <Btn variant="secondary" onClick={() => setDate(addDays(date, -1))}>‹</Btn>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="!w-auto" />
            <Btn variant="secondary" onClick={() => setDate(today)}>Today</Btn>
            <Btn variant="secondary" onClick={() => setDate(addDays(date, +1))}>›</Btn>
            <Link to="/configuration"><Btn variant="secondary">Manage Staffs</Btn></Link>
            <Btn variant="primary" onClick={() => openNew(null, '10:00')}>+ New booking</Btn>
          </div>
        }
      />

      {message && (
        <div className="mb-4">
          <Alert tone={message.tone === 'success' ? 'success' : message.tone === 'error' ? 'error' : 'warn'}>{message.text}</Alert>
        </div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <div
            className="relative grid"
            style={{
              gridTemplateColumns: `64px repeat(${columns.length}, minmax(180px, 1fr))`,
              minHeight: totalHeight
            }}
          >
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200" style={{ height: HEADER_PX }} />
            {columns.map((b, i) => (
              <div key={i}
                className="sticky top-0 z-20 bg-white border-b border-l border-gray-200 px-3 flex items-center justify-between"
                style={{ height: HEADER_PX }}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold ${b ? 'bg-[#E8F0FB] text-[#3A7BC2]' : 'bg-gray-100 text-gray-500'}`}>
                    {b ? b.displayName.slice(0, 1).toUpperCase() : '—'}
                  </div>
                  <div className="text-sm font-semibold text-[#393A3D] truncate">
                    {b ? b.displayName : 'Unassigned'}
                  </div>
                </div>
              </div>
            ))}

            <div className="border-r border-gray-200">
              {slots.map(m => (
                <div key={m} className="text-[11px] text-gray-500 pr-2 text-right border-t border-gray-100" style={{ height: SLOT_PX }}>
                  {m % 60 === 0 ? fmt(m) : ''}
                </div>
              ))}
            </div>

            {columns.map((b, ci) => (
              <div key={ci} className="relative border-l border-gray-200">
                {slots.map(m => (
                  <div
                    key={m}
                    onClick={() => openNew(b, fmt(m))}
                    className="border-t border-gray-100 hover:bg-[#F4F8FE] cursor-pointer"
                    style={{ height: SLOT_PX }}
                  />
                ))}
                {bookingsFor(b).map(bk => {
                  const start = toMin(bk.startTime);
                  if (start < DAY_START_MIN || start >= DAY_END_MIN) return null;
                  const dur = durationFor(bk);
                  const top = ((start - DAY_START_MIN) / SLOT_MIN) * SLOT_PX;
                  const height = Math.max(28, (dur / SLOT_MIN) * SLOT_PX - 2);
                  return (
                    <button
                      key={bk.id}
                      onClick={(e) => { e.stopPropagation(); setSelected(bk); }}
                      className={`absolute left-1 right-1 rounded-md border px-2 py-1 text-left text-xs shadow-sm hover:shadow ${statusColor(bk.status)}`}
                      style={{ top, height }}
                    >
                      <div className="font-semibold truncate">{bk.startTime} · {bk.customer?.fullName ?? 'Customer'}</div>
                      <div className="truncate opacity-80">{bk.service?.name}</div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {modalOpen && (
        <Modal title="New booking" onClose={() => setModalOpen(false)}>
          <div className="space-y-3">
            <Field label="Customer name"><Input value={customerName} onChange={e => setCustomerName(e.target.value)} /></Field>
            <Field label="Phone"><Input value={phone} onChange={e => setPhone(e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Time"><Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} /></Field>
              <Field label="Date"><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></Field>
            </div>
            <Field label="Service">
              <Select value={serviceId} onChange={e => setServiceId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Select service</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name} · {s.estimatedMinutes} min</option>)}
              </Select>
            </Field>
            <Field label="Staff">
              <Select value={barberId} onChange={e => setBarberId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Unassigned</option>
                {barbers.map(b => <option key={b.id} value={b.id}>{b.displayName}</option>)}
              </Select>
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Btn>
              <Btn variant="primary" onClick={createBooking}>Create</Btn>
            </div>
          </div>
        </Modal>
      )}

      {selected && (
        <Modal title={`Booking · ${selected.startTime}`} onClose={() => setSelected(null)}>
          <div className="space-y-3 text-sm">
            <div><span className="text-gray-500">Customer: </span><span className="font-semibold">{selected.customer?.fullName}</span> <span className="text-gray-500">{selected.customer?.phone}</span></div>
            <div><span className="text-gray-500">Service: </span>{selected.service?.name}</div>
            <div><span className="text-gray-500">Staff: </span>{selected.barber?.displayName ?? 'Unassigned'}</div>
            <div><span className="text-gray-500">Status: </span>{selected.status}</div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Btn variant="secondary" onClick={() => act(selected, bookingApi.confirm, 'Confirmed')}>Confirm</Btn>
              <Btn variant="secondary" onClick={() => act(selected, bookingApi.checkIn, 'Checked in')}>Check-in</Btn>
              <Btn variant="danger"    onClick={() => act(selected, bookingApi.cancel, 'Cancelled')}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-30 bg-black/40 grid place-items-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-[#393A3D]">{title}</h3>
          <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
