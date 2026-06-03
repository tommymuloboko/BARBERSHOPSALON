import { api } from './client';
import { Chair } from '../types';

export const chairApi = {
  list: () => api.get<Chair[]>('/chairs').then(r => r.data),
  available: () => api.get<Chair[]>('/chairs/available').then(r => r.data),
  create: (c: Partial<Chair>) => api.post<Chair>('/chairs', c).then(r => r.data),
  update: (id: number, patch: Partial<Chair>) =>
    api.put<Chair>(`/chairs/${id}`, patch).then(r => r.data),
  remove: (id: number) => api.delete(`/chairs/${id}`).then(r => r.data),
  updateStatus: (id: number, status: Chair['status']) =>
    api.put<Chair>(`/chairs/${id}/status`, { status }).then(r => r.data),
  updateAssignedBarber: (id: number, barberId: number | null) =>
    api.put<Chair>(`/chairs/${id}/assigned-barber`, { barberId }).then(r => r.data)
};
