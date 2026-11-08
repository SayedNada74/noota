const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class ApiClient {
  private static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    const session = localStorage.getItem('noota_auth_session');
    if (!session) return null;
    try {
      const parsed = JSON.parse(session);
      return parsed.token || null;
    } catch {
      return null;
    }
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'حدث خطأ في الاتصال بالخادم');
    }

    return data;
  }

  // -----------------------------------------------------------
  // Auth
  // -----------------------------------------------------------
  static async login(phone: string, password: string) {
    return this.request<{ success: boolean; data: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password })
    });
  }

  static async register(data: {
    storeName: string;
    ownerName: string;
    phone: string;
    password: string;
    address?: string;
  }) {
    return this.request<{ success: boolean; data: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async getMe() {
    return this.request<{ success: boolean; data: any }>('/auth/me');
  }

  // -----------------------------------------------------------
  // Customers
  // -----------------------------------------------------------
  static async getCustomers(search?: string) {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request<{ success: boolean; data: any[] }>(`/customers${query}`);
  }

  static async getCustomerById(id: string) {
    return this.request<{ success: boolean; data: any }>(`/customers/${id}`);
  }

  static async createCustomer(data: {
    name: string;
    phone?: string;
    address?: string;
    notes?: string;
    initialDebt?: number;
  }) {
    return this.request<{ success: boolean; data: any }>('/customers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // -----------------------------------------------------------
  // Transactions (Ledger)
  // -----------------------------------------------------------
  static async recordTransaction(data: {
    customerId: string;
    type: 'DEBT' | 'PAYMENT';
    amount: number;
    note?: string;
  }) {
    return this.request<{ success: boolean; data: any }>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async getCustomerHistory(customerId: string) {
    return this.request<{ success: boolean; data: any }>(`/transactions/customer/${customerId}`);
  }

  // -----------------------------------------------------------
  // Dashboard
  // -----------------------------------------------------------
  static async getDashboardMetrics() {
    return this.request<{ success: boolean; data: any }>('/dashboard/metrics');
  }
}

