export type StorePlan = 'TRIAL' | 'PRO' | 'ENTERPRISE';
export type UserRole = 'OWNER' | 'STAFF';

export interface Store {
  id: string;
  name: string;
  category: 'supermarket' | 'pharmacy' | 'kiosk' | 'workshop' | 'other';
  phone: string;
  address?: string | null;
  currency: string;
  whatsappTemplate: string;
  instapayHandle?: string | null; // حساب إنستاباي للدفع المباشر
  vodafoneCash?: string | null; // رقم محفظة فودافون كاش
  plan: StorePlan;
  planExpiresAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  storeId: string;
  name: string;
  phone: string;
  role: UserRole;
}

export interface Customer {
  id: string;
  storeId: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  currentBalance: number;
  creditLimit?: number | null; // الحد الائتماني الأقصى المسموح به للدين
  createdAt?: string;
  updatedAt?: string;
  lastTransactionAt?: string | null; // تاريخ آخر حركة لمتابعة الديون الراكدة
}

export interface Transaction {
  id: string;
  storeId: string;
  customerId: string;
  type: 'DEBT' | 'PAYMENT';
  amount: number;
  balanceAfter: number;
  note?: string | null;
  createdAt: string;
  createdBy?: { name: string } | null;
}

export interface DailySummary {
  storeId: string;
  date: string;
  totalCollectedCash: number;
  paymentsCount: number;
  totalDebtsGiven: number;
  debtsCount: number;
  netCashFlow: number;
  transactions: Transaction[];
}
