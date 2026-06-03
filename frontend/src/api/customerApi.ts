import { api } from './client';
import { Customer } from '../types';

export const customerApi = {
  list: () => api.get<Customer[]>('/customers').then(r => r.data),
  search: (phone: string) => api.get<Customer[]>(`/customers/search?phone=${encodeURIComponent(phone)}`).then(r => r.data),
  create: (c: Partial<Customer>) => api.post<Customer>('/customers', c).then(r => r.data),
  loyalty: (id: number) => api.get<{ customer: Customer; points: number; history: any[] }>(`/customers/${id}/loyalty`).then(r => r.data)
};
