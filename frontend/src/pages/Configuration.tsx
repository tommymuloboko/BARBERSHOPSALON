import { useEffect, useState } from 'react';
import { chairApi } from '../api/chairApi';
import { barberApi } from '../api/barberApi';
import { serviceApi } from '../api/serviceApi';
import { Barber, BarberStatus, Chair, ChairStatus, Service } from '../types';
import { Alert, Badge, Btn, Card, Field, Input, PageHeader, Select } from '../components/ui';
import { DEFAULT_THEME, Theme, loadTheme, resetTheme, saveTheme } from '../theme';

const CHAIR_STATUSES: ChairStatus[] = ['EMPTY', 'OCCUPIED', 'RESERVED', 'CLEANING', 'DISABLED'];
const BARBER_STATUSES: BarberStatus[] = ['AVAILABLE', 'BUSY', 'ON_BREAK', 'OFF_DUTY'];

type ChairDraft = { chairNumber: string; name: string; status: ChairStatus };
type BarberDraft = { displayName: string; specialty: string; status: BarberStatus; commissionRate: string };
type ServiceDraft = { name: string; description: string; price: string; estimatedMinutes: string };

export default function Configuration() {
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [message, setMessage] = useState<{ tone: 'success' | 'error' | 'warn'; text: string } | null>(null);

  const [editChairId, setEditChairId] = useState<number | null>(null);
  const [chairDraft, setChairDraft] = useState<ChairDraft>({ chairNumber: '', name: '', status: 'EMPTY' });
  const [editBarberId, setEditBarberId] = useState<number | null>(null);
  const [barberDraft, setBarberDraft] = useState<BarberDraft>({ displayName: '', specialty: '', status: 'AVAILABLE', commissionRate: '0' });
  const [editServiceId, setEditServiceId] = useState<number | null>(null);
  const [serviceDraft, setServiceDraft] = useState<ServiceDraft>({ name: '', description: '', price: '0', estimatedMinutes: '30' });

  const [newChairNumber, setNewChairNumber] = useState('');
  const [newChairName, setNewChairName] = useState('');

  const [newBarberName, setNewBarberName] = useState('');
  const [newBarberSpecialty, setNewBarberSpecialty] = useState('');
  const [newBarberCommission, setNewBarberCommission] = useState('0.30');

  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceMinutes, setNewServiceMinutes] = useState('30');

  const [wifiSsid, setWifiSsid] = useState(localStorage.getItem('wifi.ssid') ?? 'Knoxia-Guest');
  const [wifiPassword, setWifiPassword] = useState(localStorage.getItem('wifi.password') ?? 'welcome123');
  const [wifiSaved, setWifiSaved] = useState(false);

  const [theme, setTheme] = useState<Theme>(() => loadTheme());
  const [themeSaved, setThemeSaved] = useState(false);

  function updateTheme(patch: Partial<Theme>) {
    const next = { ...theme, ...patch };
    setTheme(next);
    saveTheme(next);
    setThemeSaved(true);
    setTimeout(() => setThemeSaved(false), 1500);
  }
  function doResetTheme() {
    setTheme(resetTheme());
  }

  function refresh() {
    chairApi.list().then(setChairs);
    barberApi.list().then(setBarbers);
    serviceApi.list().then(setServices);
  }
  useEffect(() => { refresh(); }, []);

  function flashError(prefix: string, e: any) {
    setMessage({ tone: 'error', text: prefix + (e?.response?.data?.message ?? e.message) });
  }
  function flash(tone: 'success' | 'error' | 'warn', text: string) {
    setMessage({ tone, text });
    setTimeout(() => setMessage(null), 2500);
  }

  async function assignBarber(chairId: number, barberId: number | null) {
    setMessage(null);
    try { await chairApi.updateAssignedBarber(chairId, barberId); refresh(); }
    catch (e: any) { flashError('Assign failed: ', e); }
  }

  function startEditChair(c: Chair) {
    setEditChairId(c.id);
    setChairDraft({ chairNumber: c.chairNumber, name: c.name ?? '', status: c.status });
  }
  async function saveChair(id: number) {
    try {
      await chairApi.update(id, {
        chairNumber: chairDraft.chairNumber.trim(),
        name: chairDraft.name.trim(),
        status: chairDraft.status
      });
      setEditChairId(null); refresh(); flash('success', 'Chair updated.');
    } catch (e: any) { flashError('Update chair failed: ', e); }
  }
  async function deleteChair(c: Chair) {
    if (!confirm(`Delete chair #${c.chairNumber}? It will be hidden from lists.`)) return;
    try { await chairApi.remove(c.id); refresh(); flash('success', 'Chair deleted.'); }
    catch (e: any) { flashError('Delete chair failed: ', e); }
  }

  async function addChair() {
    if (!newChairNumber.trim()) { setMessage({ tone: 'warn', text: 'Chair number is required.' }); return; }
    try {
      await chairApi.create({
        chairNumber: newChairNumber.trim(),
        name: newChairName.trim() || `Chair ${newChairNumber.trim()}`,
        status: 'EMPTY'
      });
      setNewChairNumber(''); setNewChairName(''); refresh();
    } catch (e: any) { flashError('Add chair failed: ', e); }
  }

  function startEditBarber(b: Barber) {
    setEditBarberId(b.id);
    setBarberDraft({
      displayName: b.displayName,
      specialty: b.specialty ?? '',
      status: b.status,
      commissionRate: String((b as any).commissionRate ?? 0)
    });
  }
  async function saveBarber(id: number) {
    try {
      await barberApi.update(id, {
        displayName: barberDraft.displayName.trim(),
        specialty: barberDraft.specialty.trim(),
        status: barberDraft.status,
        commissionRate: Number(barberDraft.commissionRate) || 0
      } as any);
      setEditBarberId(null); refresh(); flash('success', 'Barber updated.');
    } catch (e: any) { flashError('Update barber failed: ', e); }
  }
  async function deleteBarber(b: Barber) {
    if (!confirm(`Delete ${b.displayName}? They will be hidden from lists.`)) return;
    try { await barberApi.remove(b.id); refresh(); flash('success', 'Barber deleted.'); }
    catch (e: any) { flashError('Delete barber failed: ', e); }
  }

  async function addBarber() {
    if (!newBarberName.trim()) { setMessage({ tone: 'warn', text: 'Barber name is required.' }); return; }
    try {
      await barberApi.create({
        displayName: newBarberName.trim(),
        specialty: newBarberSpecialty.trim(),
        status: 'AVAILABLE',
        commissionRate: Number(newBarberCommission) || 0
      } as any);
      setNewBarberName(''); setNewBarberSpecialty(''); setNewBarberCommission('0.30');
      refresh();
    } catch (e: any) { flashError('Add barber failed: ', e); }
  }

  async function addService() {
    if (!newServiceName.trim()) { setMessage({ tone: 'warn', text: 'Service name is required.' }); return; }
    try {
      await serviceApi.create({
        name: newServiceName.trim(),
        price: Number(newServicePrice) || 0,
        estimatedMinutes: Number(newServiceMinutes) || 30
      });
      setNewServiceName(''); setNewServicePrice(''); setNewServiceMinutes('30');
      refresh();
    } catch (e: any) { flashError('Add service failed: ', e); }
  }

  function saveWifi() {
    localStorage.setItem('wifi.ssid', wifiSsid);
    localStorage.setItem('wifi.password', wifiPassword);
    setWifiSaved(true);
    setTimeout(() => setWifiSaved(false), 2500);
  }

  return (
    <div>
      <PageHeader title="Configuration" subtitle="Manage chairs, barbers, services and shop settings" />

      {message && (
        <div className="mb-6">
          <Alert tone={message.tone === 'success' ? 'success' : message.tone === 'error' ? 'error' : 'warn'}>{message.text}</Alert>
        </div>
      )}

      <div className="space-y-6">
        <Card title="Wi-Fi (printed on receipt)" description="Customers will see these credentials on their printed ticket">
          <div className="grid md:grid-cols-3 gap-3 items-end">
            <Field label="Network name (SSID)"><Input value={wifiSsid} onChange={e => setWifiSsid(e.target.value)} /></Field>
            <Field label="Password"><Input value={wifiPassword} onChange={e => setWifiPassword(e.target.value)} /></Field>
            <Btn variant="primary" onClick={saveWifi}>{wifiSaved ? 'Saved ✓' : 'Save Wi-Fi'}</Btn>
          </div>
        </Card>

        <Card
          title="Appearance"
          description="Customise app background and accent colours. Changes apply instantly and are saved to this device."
          actions={
            <div className="flex items-center gap-2">
              {themeSaved && <span className="text-xs text-emerald-600">Saved ✓</span>}
              <Btn variant="secondary" onClick={doResetTheme}>Reset</Btn>
            </div>
          }
        >
          <div className="grid md:grid-cols-5 gap-4">
            <ColorField label="Page background" value={theme.bg} onChange={v => updateTheme({ bg: v })} />
            <ColorField label="Primary" value={theme.brand} onChange={v => updateTheme({ brand: v })} />
            <ColorField label="Primary dark" value={theme.brandDark} onChange={v => updateTheme({ brandDark: v })} />
            <ColorField label="Primary hover" value={theme.brandHover} onChange={v => updateTheme({ brandHover: v })} />
            <ColorField label="Primary tint" value={theme.brandTint} onChange={v => updateTheme({ brandTint: v })} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <PresetSwatch name="Knoxia blue"  theme={DEFAULT_THEME} onPick={t => { setTheme(t); saveTheme(t); }} />
            <PresetSwatch name="Forest"       theme={{ bg: '#F2F6F2', brand: '#2F8F5E', brandDark: '#1F6B43', brandHover: '#287A50', brandTint: '#E1F1E8' }} onPick={t => { setTheme(t); saveTheme(t); }} />
            <PresetSwatch name="Sunset"       theme={{ bg: '#FBF6F2', brand: '#E0734A', brandDark: '#B95830', brandHover: '#CC663C', brandTint: '#FBE6DD' }} onPick={t => { setTheme(t); saveTheme(t); }} />
            <PresetSwatch name="Plum"         theme={{ bg: '#F7F3FA', brand: '#7E57C2', brandDark: '#5E3FA0', brandHover: '#6E48B0', brandTint: '#EDE3F7' }} onPick={t => { setTheme(t); saveTheme(t); }} />
            <PresetSwatch name="Slate"        theme={{ bg: '#F1F3F5', brand: '#475569', brandDark: '#334155', brandHover: '#3D4D62', brandTint: '#E2E8F0' }} onPick={t => { setTheme(t); saveTheme(t); }} />
          </div>
        </Card>

        <Card title="Chair ↔ barber assignment" description="Each barber can be assigned to only one chair">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="py-2">Chair</th>
                <th className="py-2">Name</th>
                <th className="py-2">Assigned barber</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {chairs.map(c => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="py-2.5 font-semibold">#{c.chairNumber}</td>
                  <td className="py-2.5">{c.name}</td>
                  <td className="py-2.5">
                    <Select
                      value={c.assignedBarber?.id ?? ''}
                      onChange={e => assignBarber(c.id, e.target.value ? Number(e.target.value) : null)}
                      className="!w-64"
                    >
                      <option value="">— Unassigned —</option>
                      {barbers.map(b => {
                        const takenByOther = chairs.some(cc => cc.id !== c.id && cc.assignedBarber?.id === b.id);
                        return (
                          <option key={b.id} value={b.id} disabled={takenByOther}>
                            {b.displayName}{takenByOther ? ' (assigned elsewhere)' : ''}
                          </option>
                        );
                      })}
                    </Select>
                  </td>
                  <td className="py-2.5"><Badge tone={c.status === 'EMPTY' ? 'green' : c.status === 'OCCUPIED' ? 'red' : 'gray'}>{c.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-5 pt-4 border-t border-gray-200 grid md:grid-cols-3 gap-3 items-end">
            <Field label="Chair number"><Input value={newChairNumber} onChange={e => setNewChairNumber(e.target.value)} placeholder="e.g. 5" /></Field>
            <Field label="Name"><Input value={newChairName} onChange={e => setNewChairName(e.target.value)} placeholder="Window seat" /></Field>
            <Btn variant="primary" onClick={addChair}>+ Add chair</Btn>
          </div>
        </Card>

        <Card title="Barbers">
          <ul className="divide-y divide-gray-100">
            {barbers.map(b => (
              <li key={b.id} className="py-2 flex justify-between text-sm">
                <span><span className="font-semibold text-[#393A3D]">{b.displayName}</span> <span className="text-gray-500">· {b.specialty || '—'}</span></span>
                <Badge tone={b.status === 'AVAILABLE' ? 'green' : 'gray'}>{b.status}</Badge>
              </li>
            ))}
            {barbers.length === 0 && <li className="py-2 text-sm text-gray-500">No barbers.</li>}
          </ul>
          <div className="mt-5 pt-4 border-t border-gray-200 grid md:grid-cols-4 gap-3 items-end">
            <Field label="Display name"><Input value={newBarberName} onChange={e => setNewBarberName(e.target.value)} /></Field>
            <Field label="Specialty"><Input value={newBarberSpecialty} onChange={e => setNewBarberSpecialty(e.target.value)} /></Field>
            <Field label="Commission (0-1)"><Input value={newBarberCommission} onChange={e => setNewBarberCommission(e.target.value)} /></Field>
            <Btn variant="primary" onClick={addBarber}>+ Add barber</Btn>
          </div>
        </Card>

        <Card title="Services">
          <ul className="divide-y divide-gray-100">
            {services.map(s => (
              <li key={s.id} className="py-2 flex justify-between text-sm">
                <span className="font-semibold text-[#393A3D]">{s.name}</span>
                <span className="text-gray-600">ZMW {Number(s.price).toFixed(2)} · {s.estimatedMinutes} min</span>
              </li>
            ))}
            {services.length === 0 && <li className="py-2 text-sm text-gray-500">No services.</li>}
          </ul>
          <div className="mt-5 pt-4 border-t border-gray-200 grid md:grid-cols-4 gap-3 items-end">
            <Field label="Service name"><Input value={newServiceName} onChange={e => setNewServiceName(e.target.value)} /></Field>
            <Field label="Price (ZMW)"><Input value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} /></Field>
            <Field label="Minutes"><Input value={newServiceMinutes} onChange={e => setNewServiceMinutes(e.target.value)} /></Field>
            <Btn variant="primary" onClick={addService}>+ Add service</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-10 h-9 border border-gray-300 rounded cursor-pointer bg-white p-0"
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-2 py-1.5 text-sm font-mono text-[#393A3D] focus:outline-none focus:border-[#569DE6]"
        />
      </div>
    </label>
  );
}

function PresetSwatch({ name, theme, onPick }: { name: string; theme: Theme; onPick: (t: Theme) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(theme)}
      className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-1.5 text-xs hover:bg-gray-50"
    >
      <span className="flex">
        <span className="w-4 h-4 rounded-l" style={{ background: theme.brand }} />
        <span className="w-4 h-4" style={{ background: theme.brandDark }} />
        <span className="w-4 h-4 rounded-r border border-gray-200" style={{ background: theme.bg }} />
      </span>
      {name}
    </button>
  );
}
