import { useEffect, useMemo, useState } from 'react';
import {
  accountingApi, Account, AccountType, JournalEntry,
  PostJournalLine, TrialBalanceRow, IncomeStatement, BalanceSheet
} from '../api/accountingApi';
import { Badge, Btn, Card, Field, Input, PageHeader, Select, TextArea } from '../components/ui';

type Tab = 'coa' | 'journals' | 'tb' | 'is' | 'bs';

const TYPE_TONE: Record<AccountType, 'green' | 'amber' | 'blue' | 'gray' | 'red'> = {
  ASSET: 'blue', LIABILITY: 'amber', EQUITY: 'gray', REVENUE: 'green', EXPENSE: 'red'
};

function today() { return new Date().toISOString().slice(0, 10); }
function startOfMonth() { return today().slice(0, 8) + '01'; }
function money(n: any) { return `ZMW ${Number(n || 0).toFixed(2)}`; }

export default function Accounting() {
  const [tab, setTab] = useState<Tab>('coa');

  return (
    <div>
      <PageHeader title="Accounting" subtitle="Chart of accounts, journals & reports" />

      <div className="mb-4 flex flex-wrap gap-1 border-b border-gray-200">
        {([
          ['coa', 'Chart of Accounts'],
          ['journals', 'Journal Entries'],
          ['tb', 'Trial Balance'],
          ['is', 'Income Statement'],
          ['bs', 'Balance Sheet']
        ] as [Tab, string][]).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-md transition
              ${tab === k
                ? 'bg-white text-[#3A7BC2] border border-gray-200 border-b-white -mb-px'
                : 'text-gray-600 hover:text-[#3A7BC2]'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'coa' && <ChartOfAccounts />}
      {tab === 'journals' && <Journals />}
      {tab === 'tb' && <TrialBalance />}
      {tab === 'is' && <IncomeStatementView />}
      {tab === 'bs' && <BalanceSheetView />}
    </div>
  );
}

/* ---------- Chart of Accounts ---------- */
function ChartOfAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('EXPENSE');

  function refresh() { accountingApi.accounts().then(setAccounts); }
  useEffect(refresh, []);

  async function add() {
    if (!code.trim() || !name.trim()) return;
    await accountingApi.createAccount({ code: code.trim(), name: name.trim(), type, active: true });
    setCode(''); setName('');
    refresh();
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <Card title="Add account">
        <div className="space-y-3">
          <Field label="Code"><Input value={code} onChange={e => setCode(e.target.value)} placeholder="6700" /></Field>
          <Field label="Name"><Input value={name} onChange={e => setName(e.target.value)} placeholder="Bank charges" /></Field>
          <Field label="Type">
            <Select value={type} onChange={e => setType(e.target.value as AccountType)}>
              <option value="ASSET">Asset</option>
              <option value="LIABILITY">Liability</option>
              <option value="EQUITY">Equity</option>
              <option value="REVENUE">Revenue</option>
              <option value="EXPENSE">Expense</option>
            </Select>
          </Field>
          <Btn variant="primary" className="w-full" onClick={add}>Add account</Btn>
        </div>
      </Card>

      <div className="xl:col-span-2">
        <Card title={`Chart of accounts (${accounts.length})`}>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-gray-500 uppercase tracking-wide">
              <tr><th className="py-2">Code</th><th className="py-2">Name</th><th className="py-2">Type</th></tr>
            </thead>
            <tbody>
              {accounts.map(a => (
                <tr key={a.id} className="border-t border-gray-100">
                  <td className="py-2.5 font-mono text-[#393A3D]">{a.code}</td>
                  <td className="py-2.5 font-medium">{a.name}</td>
                  <td className="py-2.5"><Badge tone={TYPE_TONE[a.type]}>{a.type}</Badge></td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr><td colSpan={3} className="py-4 text-center text-sm text-gray-500">No accounts.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Journal Entries ---------- */
type DraftLine = { accountCode: string; debit: string; credit: string; memo: string };

function Journals() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [entryDate, setEntryDate] = useState(today());
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<DraftLine[]>([
    { accountCode: '', debit: '0', credit: '0', memo: '' },
    { accountCode: '', debit: '0', credit: '0', memo: '' }
  ]);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    accountingApi.accounts().then(setAccounts);
    accountingApi.journals().then(setJournals);
  }
  useEffect(refresh, []);

  const totals = useMemo(() => {
    const d = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
    const c = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
    return { debit: d, credit: c, diff: d - c };
  }, [lines]);

  function updateLine(i: number, patch: Partial<DraftLine>) {
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, ...patch } : l));
  }
  function addLine() { setLines(prev => [...prev, { accountCode: '', debit: '0', credit: '0', memo: '' }]); }
  function removeLine(i: number) { setLines(prev => prev.length <= 2 ? prev : prev.filter((_, idx) => idx !== i)); }

  async function post() {
    setError(null);
    try {
      const payload: PostJournalLine[] = lines
        .filter(l => l.accountCode && (Number(l.debit) > 0 || Number(l.credit) > 0))
        .map(l => ({
          accountCode: l.accountCode,
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0,
          memo: l.memo || undefined
        }));
      if (payload.length < 2) throw new Error('Add at least two lines.');
      await accountingApi.postJournal({ entryDate, reference: reference || undefined, description: description || undefined, lines: payload });
      setReference(''); setDescription('');
      setLines([{ accountCode: '', debit: '0', credit: '0', memo: '' }, { accountCode: '', debit: '0', credit: '0', memo: '' }]);
      refresh();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to post journal');
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-1">
        <Card title="New journal entry">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date"><Input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} /></Field>
              <Field label="Reference"><Input value={reference} onChange={e => setReference(e.target.value)} placeholder="JE-001" /></Field>
            </div>
            <Field label="Description"><TextArea rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Narration" /></Field>

            <div className="space-y-2">
              {lines.map((l, i) => (
                <div key={i} className="grid grid-cols-12 gap-1 items-center">
                  <Select className="!col-span-5" value={l.accountCode} onChange={e => updateLine(i, { accountCode: e.target.value })}>
                    <option value="">Select…</option>
                    {accounts.map(a => <option key={a.id} value={a.code}>{a.code} — {a.name}</option>)}
                  </Select>
                  <Input className="!col-span-3 text-right" type="number" min="0" step="0.01" value={l.debit} onChange={e => updateLine(i, { debit: e.target.value })} />
                  <Input className="!col-span-3 text-right" type="number" min="0" step="0.01" value={l.credit} onChange={e => updateLine(i, { credit: e.target.value })} />
                  <button onClick={() => removeLine(i)} className="col-span-1 text-gray-400 hover:text-red-500" title="Remove">×</button>
                </div>
              ))}
              <div className="grid grid-cols-12 gap-1 text-[11px] uppercase tracking-wide text-gray-500">
                <div className="col-span-5">Account</div>
                <div className="col-span-3 text-right">Debit</div>
                <div className="col-span-3 text-right">Credit</div>
              </div>
              <Btn variant="ghost" onClick={addLine}>+ Add line</Btn>
            </div>

            <div className={`text-sm rounded-md p-2 flex justify-between ${totals.diff === 0 ? 'bg-[#E8F0FB] text-[#3A7BC2]' : 'bg-amber-50 text-amber-700'}`}>
              <span>Debit: <b>{totals.debit.toFixed(2)}</b></span>
              <span>Credit: <b>{totals.credit.toFixed(2)}</b></span>
              <span>Diff: <b>{totals.diff.toFixed(2)}</b></span>
            </div>

            {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}

            <Btn variant="primary" className="w-full" onClick={post} disabled={totals.diff !== 0 || totals.debit === 0}>Post journal</Btn>
          </div>
        </Card>
      </div>

      <div className="xl:col-span-2">
        <Card title={`Journal log (${journals.length})`}>
          <div className="space-y-3">
            {journals.map(j => (
              <div key={j.id} className="border border-gray-200 rounded-md overflow-hidden">
                <div className="px-3 py-2 bg-[#F4F5F8] flex items-center justify-between text-sm">
                  <div className="font-semibold text-[#393A3D]">
                    #{j.id} · {j.entryDate} {j.reference ? <span className="text-gray-500">· {j.reference}</span> : null}
                  </div>
                  <Badge tone={j.source === 'MANUAL' ? 'gray' : 'blue'}>{j.source}</Badge>
                </div>
                {j.description && <div className="px-3 pt-2 text-xs text-gray-600">{j.description}</div>}
                <table className="w-full text-sm">
                  <thead className="text-left text-[11px] text-gray-500 uppercase">
                    <tr>
                      <th className="px-3 py-1">Account</th>
                      <th className="px-3 py-1 text-right">Debit</th>
                      <th className="px-3 py-1 text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {j.lines.map(l => (
                      <tr key={l.id} className="border-t border-gray-100">
                        <td className="px-3 py-1.5"><span className="font-mono text-gray-500">{l.account.code}</span> {l.account.name}{l.memo ? <span className="text-gray-400"> — {l.memo}</span> : null}</td>
                        <td className="px-3 py-1.5 text-right">{Number(l.debit) ? money(l.debit) : ''}</td>
                        <td className="px-3 py-1.5 text-right">{Number(l.credit) ? money(l.credit) : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            {journals.length === 0 && <div className="text-sm text-gray-500 text-center py-4">No journals.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Trial Balance ---------- */
function TrialBalance() {
  const [asOf, setAsOf] = useState(today());
  const [rows, setRows] = useState<TrialBalanceRow[]>([]);

  function load() { accountingApi.trialBalance(asOf).then(setRows); }
  useEffect(load, [asOf]);

  const totals = useMemo(() => ({
    debit: rows.reduce((s, r) => s + Number(r.debit || 0), 0),
    credit: rows.reduce((s, r) => s + Number(r.credit || 0), 0)
  }), [rows]);

  return (
    <Card
      title="Trial balance"
      actions={<Input type="date" value={asOf} onChange={e => setAsOf(e.target.value)} className="!w-44" />}
    >
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-gray-500 uppercase tracking-wide">
          <tr>
            <th className="py-2">Code</th>
            <th className="py-2">Account</th>
            <th className="py-2">Type</th>
            <th className="py-2 text-right">Debit</th>
            <th className="py-2 text-right">Credit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.code} className="border-t border-gray-100">
              <td className="py-2 font-mono text-gray-500">{r.code}</td>
              <td className="py-2 font-medium">{r.name}</td>
              <td className="py-2"><Badge tone={TYPE_TONE[r.type]}>{r.type}</Badge></td>
              <td className="py-2 text-right">{Number(r.debit) ? money(r.debit) : ''}</td>
              <td className="py-2 text-right">{Number(r.credit) ? money(r.credit) : ''}</td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-gray-500">No activity.</td></tr>}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-300 font-bold text-[#3A7BC2]">
            <td colSpan={3} className="py-2 text-right">Totals</td>
            <td className="py-2 text-right">{money(totals.debit)}</td>
            <td className="py-2 text-right">{money(totals.credit)}</td>
          </tr>
        </tfoot>
      </table>
    </Card>
  );
}

/* ---------- Income Statement ---------- */
function IncomeStatementView() {
  const [from, setFrom] = useState(startOfMonth());
  const [to, setTo] = useState(today());
  const [data, setData] = useState<IncomeStatement | null>(null);

  function load() { accountingApi.incomeStatement(from, to).then(setData); }
  useEffect(load, [from, to]);

  return (
    <Card
      title="Income statement"
      actions={
        <div className="flex items-center gap-2">
          <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="!w-40" />
          <span className="text-xs text-gray-500">to</span>
          <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="!w-40" />
        </div>
      }
    >
      {!data ? <div className="text-sm text-gray-500">Loading…</div> : (
        <div className="space-y-4 text-sm">
          <section>
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Revenue</div>
            {data.revenues.map(r => (
              <div key={r.code} className="flex justify-between py-1 border-b border-gray-100">
                <span><span className="font-mono text-gray-500">{r.code}</span> {r.name}</span>
                <span>{money(r.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between py-1 font-semibold">
              <span>Total revenue</span><span>{money(data.totalRevenue)}</span>
            </div>
          </section>
          <section>
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Expenses</div>
            {data.expenses.map(r => (
              <div key={r.code} className="flex justify-between py-1 border-b border-gray-100">
                <span><span className="font-mono text-gray-500">{r.code}</span> {r.name}</span>
                <span>{money(r.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between py-1 font-semibold">
              <span>Total expenses</span><span>{money(data.totalExpense)}</span>
            </div>
          </section>
          <div className={`flex justify-between text-base font-bold rounded-md px-3 py-2 ${Number(data.netIncome) >= 0 ? 'bg-[#E8F0FB] text-[#3A7BC2]' : 'bg-red-50 text-red-700'}`}>
            <span>Net income</span><span>{money(data.netIncome)}</span>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ---------- Balance Sheet ---------- */
function BalanceSheetView() {
  const [asOf, setAsOf] = useState(today());
  const [data, setData] = useState<BalanceSheet | null>(null);

  function load() { accountingApi.balanceSheet(asOf).then(setData); }
  useEffect(load, [asOf]);

  function section(title: string, items: { code: string; name: string; amount: number }[], total: number) {
    return (
      <div>
        <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">{title}</div>
        {items.map(r => (
          <div key={r.code} className="flex justify-between py-1 border-b border-gray-100">
            <span><span className="font-mono text-gray-500">{r.code}</span> {r.name}</span>
            <span>{money(r.amount)}</span>
          </div>
        ))}
        <div className="flex justify-between py-1 font-semibold">
          <span>Total {title.toLowerCase()}</span><span>{money(total)}</span>
        </div>
      </div>
    );
  }

  return (
    <Card
      title="Balance sheet"
      actions={<Input type="date" value={asOf} onChange={e => setAsOf(e.target.value)} className="!w-44" />}
    >
      {!data ? <div className="text-sm text-gray-500">Loading…</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-4">
            {section('Assets', data.assets, data.totalAssets)}
          </div>
          <div className="space-y-4">
            {section('Liabilities', data.liabilities, data.totalLiabilities)}
            {section('Equity', data.equity, data.totalEquity)}
            <div className={`flex justify-between font-bold rounded-md px-3 py-2 ${Number(data.totalAssets).toFixed(2) === Number(data.totalLiabilitiesAndEquity).toFixed(2) ? 'bg-[#E8F0FB] text-[#3A7BC2]' : 'bg-amber-50 text-amber-700'}`}>
              <span>Liabilities + Equity</span><span>{money(data.totalLiabilitiesAndEquity)}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
