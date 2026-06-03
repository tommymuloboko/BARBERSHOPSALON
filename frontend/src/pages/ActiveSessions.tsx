import { useEffect, useMemo, useState } from 'react';
import { sessionApi, saleApi, paymentApi, feedbackApi } from '../api/posApi';
import { ServiceSession, PaymentMethod } from '../types';
import { Badge, Btn, Card, Field, Input, PageHeader, Select, TextArea } from '../components/ui';

function useTick(intervalMs = 30_000) {
  const [, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT(x => x + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}

function elapsed(from?: string) {
  if (!from) return '—';
  const start = new Date(from).getTime();
  const mins = Math.max(0, Math.floor((Date.now() - start) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function initials(name?: string) {
  if (!name) return '?';
  return name.split(/\s+/).slice(0, 2).map(p => p.charAt(0)).join('').toUpperCase();
}

function statusTone(s: string) {
  switch (s) {
    case 'ACTIVE': return 'green' as const;
    case 'PENDING': return 'amber' as const;
    case 'COMPLETED': return 'blue' as const;
    default: return 'gray' as const;
  }
}

export default function ActiveSessions() {
  const [sessions, setSessions] = useState<ServiceSession[]>([]);
  const [payingSession, setPayingSession] = useState<ServiceSession | null>(null);
  useTick();

  function refresh() {
    sessionApi.active().then(setSessions).catch(() => setSessions([]));
  }
  useEffect(refresh, []);

  async function startSession(s: ServiceSession) {
    try { await sessionApi.start(s.id); refresh(); }
    catch (e: any) { alert('Start failed: ' + (e?.response?.data?.message ?? e.message)); }
  }

  const totals = useMemo(() => {
    const active = sessions.filter(s => s.status === 'ACTIVE').length;
    const pending = sessions.filter(s => s.status === 'PENDING').length;
    const value = sessions.reduce((sum, s) => sum + Number(s.serviceItem?.price ?? 0), 0);
    return { active, pending, value };
  }, [sessions]);

  return (
    <div>
      <PageHeader
        title="Active Sessions"
        subtitle="Currently running services"
        actions={<Btn variant="secondary" onClick={refresh}>Refresh</Btn>}
      />

      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        <StatTile label="Active" value={String(totals.active)} accent="#569DE6" />
        <StatTile label="Pending" value={String(totals.pending)} accent="#D97706" />
        <StatTile label="Open value (ZMW)" value={totals.value.toFixed(2)} accent="#0E7AC2" />
      </div>

      {sessions.length === 0 ? (
        <Card>
          <div className="py-10 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-[#E8F0FB] grid place-items-center text-2xl text-[#569DE6]">✓</div>
            <div className="mt-3 text-sm font-semibold text-[#393A3D]">No active sessions</div>
            <div className="text-xs text-gray-500">Allocate a customer from the POS to get started.</div>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sessions.map(s => (
            <SessionCard
              key={s.id}
              s={s}
              onPay={() => setPayingSession(s)}
              onStart={() => startSession(s)}
            />
          ))}
        </div>
      )}

      {payingSession && (
        <PayModal session={payingSession} onClose={() => { setPayingSession(null); refresh(); }} />
      )}
    </div>
  );
}

function StatTile({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <span className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: accent }} />
      <div className="p-4 pl-5">
        <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
        <div className="mt-1 text-2xl font-bold text-[#393A3D]">{value}</div>
      </div>
    </div>
  );
}

function SessionCard({ s, onPay, onStart }: {
  s: ServiceSession;
  onPay: () => void;
  onStart: () => void;
}) {
  const tone = statusTone(s.status);
  const price = Number(s.serviceItem?.price ?? 0);
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col hover:shadow-md transition">
      <div className="px-4 py-3 bg-[#E8F0FB] border-b border-[#BFD7F2] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-md bg-[#569DE6] text-white grid place-items-center text-sm font-bold">
            {s.chair?.chairNumber}
          </div>
          <div>
            <div className="text-xs text-[#3A7BC2] font-semibold uppercase tracking-wide">Chair {s.chair?.chairNumber}</div>
            <div className="text-[11px] text-gray-600">{s.chair?.name}</div>
          </div>
        </div>
        <Badge tone={tone}>{s.status}</Badge>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#F4F5F8] border border-gray-200 grid place-items-center text-sm font-bold text-[#393A3D]">
            {initials(s.customer?.fullName)}
          </div>
          <div className="min-w-0">
            <div className="text-base font-semibold text-[#393A3D] truncate">{s.customer?.fullName}</div>
            <div className="text-xs text-gray-500 truncate">with {s.barber?.displayName ?? '—'}</div>
          </div>
        </div>

        <div className="bg-[#F4F5F8] border border-gray-200 rounded-md px-3 py-2 flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-xs text-gray-500">Service</div>
            <div className="text-sm font-medium text-[#393A3D] truncate">{s.serviceItem?.name}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Total</div>
            <div className="text-sm font-bold text-[#569DE6]">ZMW {price.toFixed(2)}</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {s.startedAt
              ? <>Started <span className="font-semibold text-[#393A3D]">{elapsed(s.startedAt)}</span> ago</>
              : <span className="italic">Not started</span>}
          </span>
          {s.serviceItem?.estimatedMinutes && (
            <span>~{s.serviceItem.estimatedMinutes} min</span>
          )}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-gray-200 bg-white flex gap-2">
        {s.status === 'PENDING' && (
          <Btn variant="secondary" className="flex-1" onClick={onStart}>Start</Btn>
        )}
        <Btn variant="primary" className="flex-1" onClick={onPay}>Complete &amp; pay</Btn>
      </div>
    </div>
  );
}

type RatingValue = 4 | 3 | 2 | 1 | 0;
type FeedbackCategory = 'service' | 'professionalism' | 'cleanliness' | 'waiting';

const RATING_OPTIONS: { label: string; value: RatingValue }[] = [
  { label: 'Excellent', value: 4 },
  { label: 'Good', value: 3 },
  { label: 'Fair', value: 2 },
  { label: 'Poor', value: 1 }
];

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  service: 'Service Quality',
  professionalism: 'Barber Professionalism',
  cleanliness: 'Cleanliness',
  waiting: 'Waiting Time'
};

function StarRow({ value, onChange }: { value: RatingValue; onChange: (v: RatingValue) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {RATING_OPTIONS.map(opt => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              'flex flex-col items-center gap-1 py-2 px-1 rounded-md border text-[11px] font-medium transition',
              active
                ? 'border-[#F5A524] bg-[#FFF8E6] text-[#8A5A00] shadow-sm'
                : 'border-gray-200 bg-white text-gray-600 hover:border-[#F5A524]/60'
            ].join(' ')}
          >
            <span className="flex gap-[1px] leading-none">
              {Array.from({ length: opt.value }).map((_, i) => (
                <span
                  key={i}
                  className={active ? 'text-[#F5B301]' : 'text-[#F5B301]/40'}
                  style={{
                    fontSize: '14px',
                    textShadow: active ? '0 0 2px rgba(245,179,1,0.6)' : 'none'
                  }}
                >
                  ★
                </span>
              ))}
            </span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function PayModal({ session, onClose }: { session: ServiceSession; onClose: () => void }) {
  const servicePrice = Number(session.serviceItem?.price ?? 0);
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [tip, setTip] = useState<number>(0);
  const [amount, setAmount] = useState<number>(servicePrice);
  const [provider, setProvider] = useState('');
  const [reference, setReference] = useState('');
  const [ratings, setRatings] = useState<Record<FeedbackCategory, RatingValue>>({
    service: 0, professionalism: 0, cleanliness: 0, waiting: 0
  });
  const [recommend, setRecommend] = useState<'YES' | 'NO' | null>(null);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<'pay' | 'feedback'>('pay');
  const [saleId, setSaleId] = useState<number | null>(null);

  async function pay() {
    setBusy(true);
    try {
      const sale = await saleApi.create(session.id, 0, tip);
      await paymentApi.pay({
        saleId: sale.id,
        method, amount,
        provider: method === 'MOBILE_MONEY' ? provider : undefined,
        reference: method !== 'CASH' ? reference : undefined
      });
      setSaleId(sale.id);
      setStep('feedback');
    } catch (e: any) {
      alert('Payment failed: ' + (e?.response?.data?.message ?? e.message));
    } finally {
      setBusy(false);
    }
  }

  function applyTip(next: number) {
    const t = Math.max(0, Number.isFinite(next) ? next : 0);
    setTip(t);
    setAmount(Number((servicePrice + t).toFixed(2)));
  }

  async function submitFeedback() {
    setBusy(true);
    try {
      const given = (Object.keys(ratings) as FeedbackCategory[]).filter(k => ratings[k] > 0);
      const avg = given.length
        ? Math.round(given.reduce((s, k) => s + ratings[k], 0) / given.length)
        : 0;
      const lines = (Object.keys(ratings) as FeedbackCategory[]).map(k => {
        const label = RATING_OPTIONS.find(o => o.value === ratings[k])?.label ?? '—';
        return `${CATEGORY_LABELS[k]}: ${label}`;
      });
      lines.push(`Recommend: ${recommend ?? '—'}`);
      if (comment.trim()) lines.push(`Comments: ${comment.trim()}`);
      const fullComment = lines.join('\n');

      await feedbackApi.create({
        customerId: session.customer?.id,
        barberId: session.barber?.id,
        serviceId: session.serviceItem?.id,
        saleId: saleId ?? undefined,
        rating: avg || 1,
        comment: fullComment
      });
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <header className="px-5 py-4 border-b border-gray-200 bg-[#F4F5F8]">
          <h3 className="text-lg font-semibold text-[#393A3D]">{step === 'pay' ? 'Payment' : 'Customer feedback'}</h3>
          <p className="text-xs text-gray-500">{session.customer?.fullName} · {session.serviceItem?.name}</p>
        </header>
        <div className="p-5 space-y-4">
          {step === 'pay' ? (
            <>
              <Field label="Payment method">
                <div className="grid grid-cols-3 gap-2">
                  {([
                    {
                      key: 'CASH' as PaymentMethod,
                      label: 'Cash',
                      sub: 'ZMW notes',
                      icon: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                          <rect x="2" y="6" width="20" height="12" rx="2" />
                          <circle cx="12" cy="12" r="2.5" />
                          <path d="M6 9h.01M18 15h.01" />
                        </svg>
                      )
                    },
                    {
                      key: 'MOBILE_MONEY' as PaymentMethod,
                      label: 'Mobile Money',
                      sub: 'MTN / Airtel / Zamtel',
                      icon: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                          <rect x="6" y="2" width="12" height="20" rx="2" />
                          <path d="M11 18h2" />
                        </svg>
                      )
                    },
                    {
                      key: 'CARD' as PaymentMethod,
                      label: 'Visa / Card',
                      sub: 'Debit / Credit',
                      icon: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <path d="M2 10h20" />
                          <path d="M6 15h4" />
                        </svg>
                      )
                    }
                  ]).map(opt => {
                    const active = method === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setMethod(opt.key)}
                        className={`flex flex-col items-center justify-center gap-1 rounded-md border px-3 py-3 text-center transition
                          ${active
                            ? 'border-[#569DE6] bg-[#E8F0FB] text-[#3A7BC2] ring-2 ring-[#569DE6]'
                            : 'border-gray-200 bg-white text-[#393A3D] hover:border-[#569DE6] hover:bg-[#E8F0FB]'}`}
                      >
                        <span className={active ? 'text-[#3A7BC2]' : 'text-gray-500'}>{opt.icon}</span>
                        <span className="text-sm font-semibold">{opt.label}</span>
                        <span className="text-[10px] uppercase tracking-wide text-gray-500">{opt.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Barber tip (ZMW)">
                <div className="space-y-2">
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={tip}
                    onChange={e => applyTip(Number(e.target.value))}
                    placeholder="0.00"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[0, 5, 10, 20].map(v => (
                      <button
                        key={`flat-${v}`}
                        type="button"
                        onClick={() => applyTip(v)}
                        className={[
                          'px-2.5 py-1 rounded-md border text-xs font-medium transition',
                          tip === v
                            ? 'border-[#569DE6] bg-[#E8F0FB] text-[#3A7BC2]'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        ].join(' ')}
                      >
                        {v === 0 ? 'No tip' : `ZMW ${v}`}
                      </button>
                    ))}
                    {[10, 15, 20].map(pct => {
                      const v = Number(((servicePrice * pct) / 100).toFixed(2));
                      return (
                        <button
                          key={`pct-${pct}`}
                          type="button"
                          onClick={() => applyTip(v)}
                          className="px-2.5 py-1 rounded-md border text-xs font-medium border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        >
                          {pct}%
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Field>

              <div className="bg-[#F4F5F8] border border-gray-200 rounded-md px-3 py-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Service</span><span>ZMW {servicePrice.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Barber tip</span><span>ZMW {tip.toFixed(2)}</span></div>
                <div className="flex justify-between font-semibold text-[#393A3D] border-t border-gray-200 mt-1 pt-1">
                  <span>Total</span><span>ZMW {(servicePrice + tip).toFixed(2)}</span>
                </div>
              </div>

              <Field label="Amount paid (ZMW)">
                <Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
              </Field>
              {method === 'MOBILE_MONEY' && (
                <Field label="Provider">
                  <Select value={provider} onChange={e => setProvider(e.target.value)}>
                    <option value="">Select provider</option>
                    <option>Airtel Money</option>
                    <option>MTN Money</option>
                    <option>Zamtel Money</option>
                  </Select>
                </Field>
              )}
              {method !== 'CASH' && (
                <Field label="Reference">
                  <Input value={reference} onChange={e => setReference(e.target.value)} placeholder="Transaction ref" />
                </Field>
              )}
            </>
          ) : (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="text-center">
                <div className="text-base font-bold text-[#3A7BC2] tracking-wide">KNOXIA BARBERSHOP</div>
                <div className="text-[11px] text-gray-500 uppercase">Customer Feedback</div>
                <div className="mt-2 text-xs text-gray-600">How would you rate your experience today?</div>
              </div>

              {(Object.keys(CATEGORY_LABELS) as FeedbackCategory[]).map(key => (
                <div key={key}>
                  <div className="text-xs font-semibold text-[#393A3D] mb-1.5">{CATEGORY_LABELS[key]}</div>
                  <StarRow value={ratings[key]} onChange={v => setRatings(r => ({ ...r, [key]: v }))} />
                </div>
              ))}

              <div>
                <div className="text-xs font-semibold text-[#393A3D] mb-1.5">Would you recommend Knoxia Barbershop?</div>
                <div className="grid grid-cols-2 gap-2">
                  {(['YES', 'NO'] as const).map(v => {
                    const active = recommend === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setRecommend(v)}
                        className={[
                          'py-2 rounded-md border text-sm font-semibold transition',
                          active
                            ? (v === 'YES' ? 'border-[#569DE6] bg-[#E8F0FB] text-[#3A7BC2]' : 'border-red-400 bg-red-50 text-red-700')
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        ].join(' ')}
                      >
                        {v === 'YES' ? 'Yes' : 'No'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Field label="Comments / Suggestions">
                <TextArea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="Optional" />
              </Field>

              <div className="text-center text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                Thank you for choosing Knoxia Barbershop!<br />
                <span className="font-semibold text-[#3A7BC2]">Sharp Cuts • Bold Confidence ✂</span>
              </div>
            </div>
          )}
        </div>
        <footer className="px-5 py-3 border-t border-gray-200 flex justify-end gap-2 bg-[#F4F5F8]">
          {step === 'pay' ? (
            <>
              <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
              <Btn variant="primary" onClick={pay} disabled={busy}>{busy ? 'Processing…' : 'Pay'}</Btn>
            </>
          ) : (
            <>
              <Btn variant="secondary" onClick={onClose}>Skip</Btn>
              <Btn variant="primary" onClick={submitFeedback} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Btn>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}
