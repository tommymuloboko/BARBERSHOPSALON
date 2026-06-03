import { api } from './client';
import { Supplier } from '../types';

export const supplierApi = {
  list: () => api.get<Supplier[]>('/suppliers').then(r => r.data),
  create: (s: Partial<Supplier>) => api.post<Supplier>('/suppliers', s).then(r => r.data),
  update: (id: number, patch: Partial<Supplier>) => api.put<Supplier>(`/suppliers/${id}`, patch).then(r => r.data),
  remove: (id: number) => api.delete(`/suppliers/${id}`).then(r => r.data)
};
