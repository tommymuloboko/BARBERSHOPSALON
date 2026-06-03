import { api } from './client';
import { Expense } from '../types';

export const expenseApi = {
  list: () => api.get<Expense[]>('/expenses').then(r => r.data),
  create: (e: Partial<Expense>) => api.post<Expense>('/expenses', e).then(r => r.data),
  remove: (id: number) => api.delete(`/expenses/${id}`).then(r => r.data)
};
