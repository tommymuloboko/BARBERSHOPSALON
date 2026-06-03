import { api } from './client';

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface Account {
  id: number;
  code: string;
  name: string;
  type: AccountType;
  active: boolean;
}

export interface JournalLine {
  id: number;
  account: Account;
  debit: number;
  credit: number;
  memo?: string;
}

export interface JournalEntry {
  id: number;
  entryDate: string;
  reference?: string;
  description?: string;
  source: string;
  createdAt: string;
  lines: JournalLine[];
}

export interface PostJournalLine {
  accountCode: string;
  debit?: number;
  credit?: number;
  memo?: string;
}

export interface PostJournalRequest {
  entryDate?: string;
  reference?: string;
  description?: string;
  lines: PostJournalLine[];
}

export interface TrialBalanceRow {
  code: string;
  name: string;
  type: AccountType;
  debit: number;
  credit: number;
}

export interface ReportLine { code: string; name: string; amount: number; }

export interface IncomeStatement {
  from: string; to: string;
  revenues: ReportLine[]; expenses: ReportLine[];
  totalRevenue: number; totalExpense: number; netIncome: number;
}

export interface BalanceSheet {
  asOf: string;
  assets: ReportLine[]; liabilities: ReportLine[]; equity: ReportLine[];
  totalAssets: number; totalLiabilities: number; totalEquity: number;
  totalLiabilitiesAndEquity: number;
}

export const accountingApi = {
  accounts: () => api.get<Account[]>('/accounting/accounts').then(r => r.data),
  createAccount: (a: Partial<Account>) => api.post<Account>('/accounting/accounts', a).then(r => r.data),
  journals: () => api.get<JournalEntry[]>('/accounting/journals').then(r => r.data),
  postJournal: (req: PostJournalRequest) => api.post<JournalEntry>('/accounting/journals', req).then(r => r.data),
  trialBalance: (asOf?: string) =>
    api.get<TrialBalanceRow[]>('/accounting/reports/trial-balance', { params: asOf ? { asOf } : {} }).then(r => r.data),
  incomeStatement: (from?: string, to?: string) =>
    api.get<IncomeStatement>('/accounting/reports/income-statement', { params: { from, to } }).then(r => r.data),
  balanceSheet: (asOf?: string) =>
    api.get<BalanceSheet>('/accounting/reports/balance-sheet', { params: asOf ? { asOf } : {} }).then(r => r.data)
};
