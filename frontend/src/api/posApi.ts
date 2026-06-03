import { api } from './client';
import { ServiceSession, Sale, PaymentMethod } from '../types';

export const sessionApi = {
  allocate: (req: {
    customerName?: string;
    phone?: string;
    customerId?: number;
    chairId: number;
    barberId: number;
    serviceId: number;
    bookingId?: number;
  }) => api.post<ServiceSession>('/sessions/allocate', req).then(r => r.data),
  active: () => api.get<ServiceSession[]>('/sessions/active').then(r => r.data),
  start: (id: number) => api.put<ServiceSession>(`/sessions/${id}/start`).then(r => r.data),
  complete: (id: number) => api.put<ServiceSession>(`/sessions/${id}/complete`).then(r => r.data)
};

export const saleApi = {
  create: (sessionId: number, discount = 0, tip = 0) =>
    api.post<Sale>('/sales', { sessionId, discount, tip }).then(r => r.data),
  today: () => api.get<Sale[]>('/sales/today').then(r => r.data),
  receipt: (id: number) => api.get<{ sale: Sale; payments: any[] }>(`/sales/${id}/receipt`).then(r => r.data)
};

export const paymentApi = {
  pay: (req: {
    saleId: number;
    method: PaymentMethod;
    amount: number;
    reference?: string;
    provider?: string;
  }) => api.post('/payments', req).then(r => r.data)
};

export const feedbackApi = {
  create: (req: {
    customerId?: number;
    barberId?: number;
    serviceId?: number;
    saleId?: number;
    rating: number;
    comment?: string;
  }) => api.post('/feedback', req).then(r => r.data),
  byBarber: (id: number) => api.get(`/feedback/barber/${id}`).then(r => r.data)
};

export const loyaltyApi = {
  redeem: (customerId: number, points: number) =>
    api.post('/loyalty/redeem', { customerId, points }).then(r => r.data)
};

export const reportApi = {
  daily: (date?: string) => api.get('/reports/daily', { params: date ? { date } : {} }).then(r => r.data),
  weekly: (date?: string) => api.get('/reports/weekly', { params: date ? { date } : {} }).then(r => r.data),
  monthly: (date?: string) => api.get('/reports/monthly', { params: date ? { date } : {} }).then(r => r.data),
  range: (from: string, to: string) => api.get('/reports/range', { params: { from, to } }).then(r => r.data),
  endOfDay: (date?: string) => api.get('/reports/end-of-day', { params: date ? { date } : {} }).then(r => r.data)
};
