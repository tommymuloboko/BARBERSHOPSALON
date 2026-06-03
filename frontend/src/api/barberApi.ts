import { api } from './client';
import { Barber } from '../types';

export const barberApi = {
  list: () => api.get<Barber[]>('/barbers').then(r => r.data),
  available: () => api.get<Barber[]>('/barbers/available').then(r => r.data),
  create: (b: Partial<Barber>) => api.post<Barber>('/barbers', b).then(r => r.data),
  update: (id: number, patch: Partial<Barber>) =>
    api.put<Barber>(`/barbers/${id}`, patch).then(r => r.data),
  remove: (id: number) => api.delete(`/barbers/${id}`).then(r => r.data),
  updateStatus: (id: number, status: Barber['status']) =>
    api.put<Barber>(`/barbers/${id}/status`, { status }).then(r => r.data)
};
