export type ChairStatus = 'EMPTY' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'DISABLED';
export type BarberStatus = 'AVAILABLE' | 'BUSY' | 'ON_BREAK' | 'OFF_DUTY';
export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE_MONEY';
export type SessionStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface Chair {
  id: number;
  chairNumber: string;
  name: string;
  status: ChairStatus;
  assignedBarber?: Barber;
}

export interface Barber {
  id: number;
  displayName: string;
  specialty: string;
  status: BarberStatus;
}

export interface Customer {
  id: number;
  fullName: string;
  phone: string;
  email?: string;
  loyaltyPoints: number;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  estimatedMinutes: number;
}

export interface ServiceSession {
  id: number;
  customer: Customer;
  barber: Barber;
  chair: Chair;
  serviceItem: Service;
  status: SessionStatus;
  startedAt?: string;
  completedAt?: string;
}

export interface Sale {
  id: number;
  customer: Customer;
  barber?: Barber;
  serviceSession?: ServiceSession;
  subtotal: number;
  discount: number;
  tip?: number;
  total: number;
  paymentStatus: 'PENDING' | 'PAID' | 'PARTIAL' | 'FAILED' | 'REFUNDED';
  createdAt: string;
}

export type ItemClass = 'RESELL' | 'USE';

export interface InventoryItem {
  id: number;
  name: string;
  sku?: string;
  unit?: string;
  quantity: number;
  reorderLevel: number;
  unitCost: number;
  itemClass?: ItemClass;
  invoiceNumber?: string;
  invoiceDate?: string;
  supplierName?: string;
  supplierContact?: string;
  supplierTaxId?: string;
  vatAmount?: number;
  poNumber?: string;
  createdAt?: string;
}

export interface Expense {
  id: number;
  category: string;
  description?: string;
  amount: number;
  expenseDate: string;
  createdAt?: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact?: string;
  taxId?: string;
  address?: string;
  notes?: string;
  createdAt?: string;
}

export interface Booking {
  id: number;
  customer: Customer;
  barber?: Barber;
  service: Service;
  bookingDate: string;
  startTime: string;
  endTime?: string;
  status: BookingStatus;
  notes?: string;
}
