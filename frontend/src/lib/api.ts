import { Store, Customer, Transaction, DailySummary } from './types';

// قاعدة بيانات فارغة ونظيفة بنسبة 100% للإنتاج الحقيقي
const INITIAL_STORES: Store[] = [];
const INITIAL_CUSTOMERS: Customer[] = [];
const INITIAL_TRANSACTIONS: Transaction[] = [];

export const PlatformService = {
  // تنظيف أي مخلفات قديمة في التخزين المحلي
  purgeLegacyMockData(): void {
    if (typeof window === 'undefined') return;
    const legacyKeys = [
      'noota_stores_v1',
      'noota_stores_v2',
      'noota_stores_v3',
      'noota_customers',
      'noota_customers_v1',
      'noota_customers_v2',
      'noota_customers_v3',
      'noota_transactions_v1',
      'noota_transactions_v2',
      'noota_transactions_v3'
    ];
    legacyKeys.forEach((key) => localStorage.removeItem(key));
  },

  // -------------------------------------------------------------
  // Stores (Tenants) Management
  // -------------------------------------------------------------
  getStores(): Store[] {
    if (typeof window === 'undefined') return INITIAL_STORES;
    const stored = localStorage.getItem('noota_stores_prod');
    return stored ? JSON.parse(stored) : INITIAL_STORES;
  },

  saveStores(stores: Store[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('noota_stores_prod', JSON.stringify(stores));
  },

  getActiveStoreId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('noota_active_store_id');
  },

  setActiveStoreId(id: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('noota_active_store_id', id);
  },

  getActiveStore(): Store | null {
    const stores = this.getStores();
    const activeId = this.getActiveStoreId();
    if (!activeId) return stores[0] || null;
    return stores.find((s) => s.id === activeId) || stores[0] || null;
  },

  updateStore(storeId: string, updates: Partial<Store>): Store {
    const stores = this.getStores();
    const index = stores.findIndex((s) => s.id === storeId);
    if (index === -1) throw new Error('المحل غير موجود');

    const updated = { ...stores[index], ...updates };
    stores[index] = updated;
    this.saveStores(stores);
    return updated;
  },

  registerNewStore(data: {
    name: string;
    category: Store['category'];
    phone: string;
    address?: string;
  }): Store {
    const stores = this.getStores();
    const newStore: Store = {
      id: `store-${Date.now()}`,
      name: data.name,
      category: data.category,
      phone: data.phone,
      address: data.address || null,
      currency: 'ج.م',
      whatsappTemplate: 'السلام عليكم أستاذ {customer_name}، نود تذكيرك بأن لديك حساب متبقي بقيمة {balance} {currency} لدى ({store_name}).',
      plan: 'TRIAL',
      planExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const updatedStores = [...stores, newStore];
    this.saveStores(updatedStores);
    this.setActiveStoreId(newStore.id);
    return newStore;
  },

  // -------------------------------------------------------------
  // Customers Management (Strict Tenant Isolation)
  // -------------------------------------------------------------
  getCustomers(storeId?: string): Customer[] {
    const targetStoreId = storeId || this.getActiveStoreId();
    if (!targetStoreId) return [];
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('noota_customers_prod');
    const allCustomers: Customer[] = stored ? JSON.parse(stored) : [];
    return allCustomers.filter((c) => c.storeId === targetStoreId);
  },

  getAllCustomersAcrossPlatform(): Customer[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('noota_customers_prod');
    return stored ? JSON.parse(stored) : [];
  },

  saveAllCustomers(customers: Customer[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('noota_customers_prod', JSON.stringify(customers));
  },

  addCustomer(data: {
    name: string;
    phone?: string;
    address?: string;
    notes?: string;
    initialDebt?: number;
    creditLimit?: number;
  }): Customer {
    const storeId = this.getActiveStoreId();
    if (!storeId) throw new Error('يرجى تسجيل الدخول إلى المحل أولاً');

    const allCustomers = this.getAllCustomersAcrossPlatform();

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      storeId,
      name: data.name,
      phone: data.phone || null,
      address: data.address || null,
      notes: data.notes || null,
      currentBalance: data.initialDebt || 0,
      creditLimit: data.creditLimit || null
    };

    const updated = [newCustomer, ...allCustomers];
    this.saveAllCustomers(updated);

    if (data.initialDebt && data.initialDebt > 0) {
      this.recordTransaction({
        customerId: newCustomer.id,
        type: 'DEBT',
        amount: data.initialDebt,
        note: 'رصيد سابق مسجل عند فتح الحساب'
      });
    }

    return newCustomer;
  },

  updateCustomer(customerId: string, updates: Partial<Customer>): Customer {
    const allCustomers = this.getAllCustomersAcrossPlatform();
    const idx = allCustomers.findIndex((c) => c.id === customerId);
    if (idx === -1) throw new Error('الزبون غير موجود');

    const updated = { ...allCustomers[idx], ...updates };
    allCustomers[idx] = updated;
    this.saveAllCustomers(allCustomers);
    return updated;
  },

  // -------------------------------------------------------------
  // Transactions Ledger (Strict Tenant Isolation)
  // -------------------------------------------------------------
  getAllTransactions(): Transaction[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('noota_transactions_prod');
    return stored ? JSON.parse(stored) : [];
  },

  saveAllTransactions(txs: Transaction[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('noota_transactions_prod', JSON.stringify(txs));
  },

  getCustomerTransactions(customerId: string): Transaction[] {
    const storeId = this.getActiveStoreId();
    if (!storeId) return [];
    const all = this.getAllTransactions();
    return all
      .filter((t) => t.storeId === storeId && t.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  recordTransaction(params: {
    customerId: string;
    type: 'DEBT' | 'PAYMENT';
    amount: number;
    note?: string;
  }): { customer: Customer; transaction: Transaction } {
    const storeId = this.getActiveStoreId();
    if (!storeId) throw new Error('لا يوجد محل نشط');

    const allCustomers = this.getAllCustomersAcrossPlatform();
    const customerIndex = allCustomers.findIndex(
      (c) => c.id === params.customerId && c.storeId === storeId
    );

    if (customerIndex === -1) throw new Error('الزبون غير موجود في هذا المحل');

    const customer = allCustomers[customerIndex];
    let newBalance = customer.currentBalance;
    if (params.type === 'DEBT') {
      newBalance += params.amount;
    } else {
      newBalance -= params.amount;
    }

    const updatedCustomer: Customer = {
      ...customer,
      currentBalance: Math.round(newBalance * 100) / 100
    };
    allCustomers[customerIndex] = updatedCustomer;
    this.saveAllCustomers(allCustomers);

    const transaction: Transaction = {
      id: `tx-${Date.now()}`,
      storeId,
      customerId: params.customerId,
      type: params.type,
      amount: params.amount,
      balanceAfter: updatedCustomer.currentBalance,
      note: params.note || null,
      createdAt: new Date().toISOString(),
      createdBy: { name: 'المسؤول' }
    };

    const allTx = this.getAllTransactions();
    this.saveAllTransactions([transaction, ...allTx]);

    return { customer: updatedCustomer, transaction };
  },

  // -------------------------------------------------------------
  // Daily Closing & Reports (تقفيل اليومية والمطابقة المالية)
  // -------------------------------------------------------------
  getDailyClosing(storeId?: string): DailySummary {
    const targetStoreId = storeId || this.getActiveStoreId();
    if (!targetStoreId) {
      return {
        storeId: '',
        date: new Date().toISOString(),
        totalCollectedCash: 0,
        paymentsCount: 0,
        totalDebtsGiven: 0,
        debtsCount: 0,
        netCashFlow: 0,
        transactions: []
      };
    }

    const allTx = this.getAllTransactions().filter((t) => t.storeId === targetStoreId);
    const today = new Date().toDateString();

    const todayTxs = allTx.filter((t) => new Date(t.createdAt).toDateString() === today);

    const payments = todayTxs.filter((t) => t.type === 'PAYMENT');
    const debts = todayTxs.filter((t) => t.type === 'DEBT');

    const totalCollectedCash = payments.reduce((sum, t) => sum + t.amount, 0);
    const totalDebtsGiven = debts.reduce((sum, t) => sum + t.amount, 0);

    return {
      storeId: targetStoreId,
      date: new Date().toISOString(),
      totalCollectedCash: Math.round(totalCollectedCash * 100) / 100,
      paymentsCount: payments.length,
      totalDebtsGiven: Math.round(totalDebtsGiven * 100) / 100,
      debtsCount: debts.length,
      netCashFlow: Math.round(totalCollectedCash * 100) / 100,
      transactions: todayTxs
    };
  },

  // -------------------------------------------------------------
  // Metrics (Store-scoped & Platform-wide)
  // -------------------------------------------------------------
  getStoreMetrics(storeId?: string) {
    const targetStoreId = storeId || this.getActiveStoreId();
    if (!targetStoreId) {
      return {
        totalDebtOutside: 0,
        debtorsCount: 0,
        totalCustomers: 0,
        collectedToday: 0,
        paymentsTodayCount: 0,
        debtAddedToday: 0,
        debtsTodayCount: 0
      };
    }

    const customers = this.getCustomers(targetStoreId);
    const debtors = customers.filter((c) => c.currentBalance > 0);
    const totalDebtOutside = debtors.reduce((sum, c) => sum + c.currentBalance, 0);

    const allTx = this.getAllTransactions().filter((t) => t.storeId === targetStoreId);
    const today = new Date().toDateString();
    const txToday = allTx.filter((t) => new Date(t.createdAt).toDateString() === today);

    const collectedToday = txToday
      .filter((t) => t.type === 'PAYMENT')
      .reduce((sum, t) => sum + t.amount, 0);

    const debtsAddedToday = txToday
      .filter((t) => t.type === 'DEBT')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalDebtOutside: Math.round(totalDebtOutside * 100) / 100,
      debtorsCount: debtors.length,
      totalCustomers: customers.length,
      collectedToday: Math.round(collectedToday * 100) / 100,
      paymentsTodayCount: txToday.filter((t) => t.type === 'PAYMENT').length,
      debtAddedToday: Math.round(debtsAddedToday * 100) / 100,
      debtsTodayCount: txToday.filter((t) => t.type === 'DEBT').length
    };
  },

  getSuperAdminStats() {
    const stores = this.getStores();
    const allCustomers = this.getAllCustomersAcrossPlatform();
    const allTx = this.getAllTransactions();

    const totalPlatformDebt = allCustomers
      .filter((c) => c.currentBalance > 0)
      .reduce((sum, c) => sum + c.currentBalance, 0);

    return {
      totalStores: stores.length,
      activeStores: stores.filter((s) => s.isActive).length,
      totalCustomers: allCustomers.length,
      totalTransactions: allTx.length,
      totalPlatformDebt: Math.round(totalPlatformDebt * 100) / 100,
      monthlyRecurringRevenue: stores.filter((s) => s.plan === 'PRO').length * 450 + stores.filter((s) => s.plan === 'ENTERPRISE').length * 850 + stores.filter((s) => s.plan === 'TRIAL').length * 250
    };
  }
};
