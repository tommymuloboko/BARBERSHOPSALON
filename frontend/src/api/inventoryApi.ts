import { api } from './client';
import { InventoryItem } from '../types';

export const inventoryApi = {
  list: () => api.get<InventoryItem[]>('/inventory').then(r => r.data),
  create: (item: Partial<InventoryItem>) => api.post<InventoryItem>('/inventory', item).then(r => r.data),
  update: (id: number, patch: Partial<InventoryItem>) => api.put<InventoryItem>(`/inventory/${id}`, patch).then(r => r.data),
  remove: (id: number) => api.delete(`/inventory/${id}`).then(r => r.data)
};
