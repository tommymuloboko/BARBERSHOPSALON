import { api } from './client';
import { Booking } from '../types';

export const bookingApi = {
  today: () => api.get<Booking[]>('/bookings/today').then(r => r.data),
  byDate: (date: string) => api.get<Booking[]>(`/bookings/date/${date}`).then(r => r.data),
  create: (b: any) => api.post<Booking>('/bookings', b).then(r => r.data),
  confirm: (id: number) => api.put<Booking>(`/bookings/${id}/confirm`).then(r => r.data),
  cancel: (id: number) => api.put<Booking>(`/bookings/${id}/cancel`).then(r => r.data),
  checkIn: (id: number) => api.put<Booking>(`/bookings/${id}/check-in`).then(r => r.data)
};
