import { Store, User } from './types';
import { PlatformService } from './api';
import { ApiClient } from './api-client';

export interface AuthSession {
  user: User;
  store: Store;
  token: string;
}

const AUTH_STORAGE_KEY = 'noota_auth_session';

export const AuthService = {
  // الحصول على الجلسة الحالية
  getSession(): AuthSession | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  // تسجيل الدخول الحقيقي عبر Supabase Backend API
  async login(phone: string, password = '123456'): Promise<AuthSession> {
    try {
      const response = await ApiClient.login(phone, password);
      if (response.success && response.data) {
        const { token, user, store } = response.data;
        const session: AuthSession = {
          user: {
            id: user.id,
            storeId: store.id,
            name: user.name,
            phone: user.phone,
            role: user.role
          },
          store: {
            id: store.id,
            name: store.name,
            phone: user.phone,
            currency: store.currency || 'ج.م',
            category: 'supermarket',
            whatsappTemplate: store.whatsappTemplate || 'السلام عليكم أستاذ {customer_name}، نود تذكيرك بأن لديك حساب متبقي بقيمة {balance} {currency} لدى ({store_name}).',
            plan: 'PRO',
            planExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString(),
            isActive: true,
            createdAt: new Date().toISOString()
          },
          token
        };

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
        PlatformService.setActiveStoreId(store.id);
        return session;
      }
    } catch (apiError) {
      console.warn('API connection fallback to local state:', apiError);
    }

    // Fallback: البحث في المخزن المحلي إن تعذر الاتصال
    const stores = PlatformService.getStores();
    const store = stores.find((s) => s.phone === phone);
    if (!store) {
      throw new Error('رقم الهاتف غير مسجل لدينا، يرجى إنشاء حساب محل جديد');
    }

    const session: AuthSession = {
      user: {
        id: `user-${store.id}`,
        storeId: store.id,
        name: `صاحب ${store.name}`,
        phone: store.phone,
        role: 'OWNER'
      },
      store,
      token: `jwt-token-${store.id}-${Date.now()}`
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    PlatformService.setActiveStoreId(store.id);
    return session;
  },

  // إنشاء حساب محل جديد عبر السيرفر
  async register(data: {
    storeName: string;
    ownerName: string;
    phone: string;
    password: string;
    category: Store['category'];
    address?: string;
  }): Promise<AuthSession> {
    try {
      const response = await ApiClient.register({
        storeName: data.storeName,
        ownerName: data.ownerName,
        phone: data.phone,
        password: data.password,
        address: data.address
      });

      if (response.success && response.data) {
        const { token, user, store } = response.data;
        const session: AuthSession = {
          user: {
            id: user.id,
            storeId: store.id,
            name: user.name,
            phone: user.phone,
            role: user.role
          },
          store: {
            id: store.id,
            name: store.name,
            phone: user.phone,
            currency: store.currency || 'ج.م',
            category: data.category,
            whatsappTemplate: 'السلام عليكم أستاذ {customer_name}، نود تذكيرك بأن لديك حساب متبقي بقيمة {balance} {currency} لدى ({store_name}).',
            plan: 'TRIAL',
            planExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
            isActive: true,
            createdAt: new Date().toISOString()
          },
          token
        };

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
        PlatformService.setActiveStoreId(store.id);
        return session;
      }
    } catch (apiError) {
      console.warn('API registration fallback:', apiError);
    }

    // Fallback: إنشاء محلي
    const newStore = PlatformService.registerNewStore({
      name: data.storeName,
      category: data.category,
      phone: data.phone,
      address: data.address
    });

    const session: AuthSession = {
      user: {
        id: `user-${newStore.id}`,
        storeId: newStore.id,
        name: data.ownerName,
        phone: data.phone,
        role: 'OWNER'
      },
      store: newStore,
      token: `jwt-token-${newStore.id}-${Date.now()}`
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    PlatformService.setActiveStoreId(newStore.id);
    return session;
  },

  saveSession(session: AuthSession): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  },

  logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};
