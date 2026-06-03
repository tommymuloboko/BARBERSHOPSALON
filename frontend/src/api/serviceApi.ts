import { api } from './client';
import { Service } from '../types';

export const serviceApi = {
  list: () => api.get<Service[]>('/services').then(r => r.data),
  create: (s: Partial<Service>) => api.post<Service>('/services', s).then(r => r.data),
  update: (id: number, patch: Partial<Service>) =>
    api.put<Service>(`/services/${id}`, patch).then(r => r.data),
  remove: (id: number) => api.delete(`/services/${id}`).then(r => r.data)
};
