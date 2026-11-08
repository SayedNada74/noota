'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Store as StoreIcon,
  Users,
  Search,
  Plus,
  TrendingDown,
  TrendingUp,
  Receipt,
  UserPlus,
  Sliders,
  LogOut,
  CalendarCheck,
  ArrowRight,
  WifiOff,
  Download
} from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MobileTaskbar } from '@/components/ui/MobileTaskbar';
import { CustomerCard } from '@/components/features/CustomerCard';
import { QuickTransactionModal } from '@/components/features/QuickTransactionModal';
import { AddCustomerModal } from '@/components/features/AddCustomerModal';
import { EditCustomerModal } from '@/components/features/EditCustomerModal';
import { CustomerHistoryModal, LedgerTransaction } from '@/components/features/CustomerHistoryModal';
import { DailyClosingModal } from '@/components/features/DailyClosingModal';
import { StoreSettingsView } from '@/components/features/StoreSettingsView';
import { AuthView } from '@/components/auth/AuthView';
import { LandingView } from '@/components/marketing/LandingView';
import { AuthService, AuthSession } from '@/lib/auth';
import { PlatformService } from '@/lib/api';
import { ApiClient } from '@/lib/api-client';
import { exportCustomersToCSV } from '@/lib/export';
import { Store, Customer, DailySummary } from '@/lib/types';
import { normalizeArabic } from '@/lib/utils';

export default function AppRoot() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authViewMode, setAuthViewMode] = useState<'landing' | 'auth'>('landing');
  const [activeTab, setActiveTab] = useState<'ledger' | 'settings'>('ledger');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'debtors' | 'settled' | 'stale'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Search shortcut (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Modals
  const [isQuickTxOpen, setIsQuickTxOpen] = useState(false);
  const [quickTxType, setQuickTxType] = useState<'DEBT' | 'PAYMENT'>('DEBT');
  const [selectedCustomerIdForTx, setSelectedCustomerIdForTx] = useState<string | null>(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isDailyClosingOpen, setIsDailyClosingOpen] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [selectedCustomerForEdit, setSelectedCustomerForEdit] = useState<Customer | null>(null);

  const [historyModalState, setHistoryModalState] = useState<{
    isOpen: boolean;
    customer: Customer | null;
    transactions: LedgerTransaction[];
  }>({
    isOpen: false,
    customer: null,
    transactions: []
  });

  // Check auth session on load
  useEffect(() => {
    PlatformService.purgeLegacyMockData();
    const existingSession = AuthService.getSession();
    if (existingSession) {
      setSession(existingSession);
      const custs = PlatformService.getCustomers(existingSession.store.id);
      setCustomers(custs);
    }
  }, []);

  const refreshStoreData = async (storeId: string) => {
    try {
      const response = await ApiClient.getCustomers();
      if (response.success && Array.isArray(response.data)) {
        const mappedCusts: Customer[] = response.data.map((c: any) => ({
          id: c.id,
          storeId: c.storeId,
          name: c.name,
          phone: c.phone,
          address: c.address,
          notes: c.notes,
          currentBalance: Number(c.currentBalance || 0),
          creditLimit: c.creditLimit ? Number(c.creditLimit) : null
        }));
        setCustomers(mappedCusts);
        PlatformService.saveAllCustomers(mappedCusts);
        return;
      }
    } catch (err) {
      console.warn('API getCustomers fallback to local cache:', err);
    }
    const custs = PlatformService.getCustomers(storeId);
    setCustomers(custs);
  };

  const handleLoginSuccess = (newSession: AuthSession) => {
    setSession(newSession);
    setActiveTab('ledger');
    refreshStoreData(newSession.store.id);
  };

  const handleLogout = () => {
    AuthService.logout();
    setSession(null);
    setAuthViewMode('landing');
  };

  const handleUpdateStore = (updates: Partial<Store>) => {
    if (!session) return;
    const updated = PlatformService.updateStore(session.store.id, updates);
    const updatedSession = { ...session, store: updated };
    setSession(updatedSession);
    AuthService.saveSession(updatedSession);
  };

  // Metrics for the logged-in store only
  const storeMetrics = useMemo(() => {
    if (!session) return null;
    return PlatformService.getStoreMetrics(session.store.id);
  }, [session, customers]);

  // Daily summary for logged-in store
  const dailySummary: DailySummary | null = useMemo(() => {
    if (!session) return null;
    return PlatformService.getDailyClosing(session.store.id);
  }, [session, customers]);

  // حساب عدد الأيام منذ آخر حركة للزبون (رادار الديون الراكدة والمتأخرة)
  const getCustomerInactivityDays = (c: Customer): number => {
    const txs = PlatformService.getCustomerTransactions(c.id);
    if (txs.length > 0 && txs[0]?.createdAt) {
      const latest = new Date(txs[0].createdAt).getTime();
      return Math.max(0, Math.floor((Date.now() - latest) / (1000 * 60 * 60 * 24)));
    }
    if (c.createdAt) {
      const created = new Date(c.createdAt).getTime();
      return Math.max(0, Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24)));
    }
    return 0;
  };

  // Filtered customer list for the logged-in store using Arabic Text Normalization
  const filteredCustomers = useMemo(() => {
    const normQuery = normalizeArabic(searchQuery);
    return customers.filter((c) => {
      const isDebtor = c.currentBalance > 0;
      const isSettled = c.currentBalance <= 0;
      const isStale = isDebtor && getCustomerInactivityDays(c) >= 30;

      if (!normQuery) {
        if (filterType === 'debtors') return isDebtor;
        if (filterType === 'settled') return isSettled;
        if (filterType === 'stale') return isStale;
        return true;
      }

      const matchesSearch =
        normalizeArabic(c.name).includes(normQuery) ||
        (c.phone && c.phone.includes(searchQuery.trim()));

      if (!matchesSearch) return false;

      if (filterType === 'debtors') return isDebtor;
      if (filterType === 'settled') return isSettled;
      if (filterType === 'stale') return isStale;
      return true;
    });
  }, [customers, searchQuery, filterType]);

  // Transaction handlers
  const handleOpenDebt = (customerId: string) => {
    setSelectedCustomerIdForTx(customerId);
    setQuickTxType('DEBT');
    setIsQuickTxOpen(true);
  };

  const handleOpenPayment = (customerId: string) => {
    setSelectedCustomerIdForTx(customerId);
    setQuickTxType('PAYMENT');
    setIsQuickTxOpen(true);
  };

  const handleOpenGeneralTx = () => {
    setSelectedCustomerIdForTx(null);
    setQuickTxType('DEBT');
    setIsQuickTxOpen(true);
  };

  const handleOpenHistory = async (customerId: string) => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;
    let txs = PlatformService.getCustomerTransactions(customerId);
    try {
      const response = await ApiClient.getCustomerHistory(customerId);
      if (response.success && response.data?.transactions) {
        txs = response.data.transactions.map((t: any) => ({
          id: t.id,
          storeId: t.storeId,
          customerId: t.customerId,
          type: t.type,
          amount: Number(t.amount),
          balanceAfter: Number(t.balanceAfter),
          note: t.note,
          createdAt: t.createdAt,
          createdBy: t.createdBy
        }));
      }
    } catch (err) {
      console.warn('API getCustomerHistory fallback:', err);
    }

    setHistoryModalState({
      isOpen: true,
      customer: cust,
      transactions: txs as any
    });
  };

  const handleTransactionSubmit = async (data: {
    customerId: string;
    type: 'DEBT' | 'PAYMENT';
    amount: number;
    note?: string;
  }) => {
    if (!session) return;
    try {
      await ApiClient.recordTransaction(data);
    } catch (err) {
      console.warn('API sync fallback to local store:', err);
    }
    PlatformService.recordTransaction(data);
    await refreshStoreData(session.store.id);

    if (historyModalState.isOpen && historyModalState.customer?.id === data.customerId) {
      const updatedTxs = PlatformService.getCustomerTransactions(data.customerId);
      const updatedCust = PlatformService.getCustomers().find((c) => c.id === data.customerId);
      setHistoryModalState((prev) => ({
        ...prev,
        customer: updatedCust || prev.customer,
        transactions: updatedTxs as any
      }));
    }
  };

  const handleAddCustomerSubmit = async (data: {
    name: string;
    phone?: string;
    address?: string;
    notes?: string;
    initialDebt?: number;
    creditLimit?: number;
  }) => {
    if (!session) return;
    try {
      await ApiClient.createCustomer(data);
    } catch (err) {
      console.warn('API sync fallback to local store:', err);
    }
    PlatformService.addCustomer(data);
    await refreshStoreData(session.store.id);
  };

  const handleOpenEdit = (customerId: string) => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;
    setSelectedCustomerForEdit(cust);
    setIsEditCustomerOpen(true);
  };

  const handleSaveCustomer = async (id: string, updates: Partial<Customer>) => {
    if (!session) return;
    PlatformService.updateCustomer(id, updates);
    await refreshStoreData(session.store.id);
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!session) return;
    const all = PlatformService.getAllCustomersAcrossPlatform().filter((c) => c.id !== id);
    PlatformService.saveAllCustomers(all);
    await refreshStoreData(session.store.id);
  };

  // 1. IF NOT LOGGED IN -> SHOW LANDING PAGE OR AUTH VIEW
  if (!session) {
    if (authViewMode === 'landing') {
      return (
        <LandingView
          onGetStarted={() => setAuthViewMode('auth')}
          onLogin={() => setAuthViewMode('auth')}
        />
      );
    }

    return (
      <div className="relative">
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAuthViewMode('landing')}
            className="text-xs text-slate-400 hover:text-white"
          >
            ← العودة للصفحة الرئيسية
          </Button>
        </div>
        <AuthView
          onSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  // 3. IF LOGGED IN -> SHOW ONLY THIS MERCHANT'S ISOLATED DASHBOARD
  const currentStore = session.store;
  const debtorsCount = customers.filter((c) => c.currentBalance > 0).length;
  const settledCount = customers.filter((c) => c.currentBalance <= 0).length;
  const staleCount = customers.filter((c) => c.currentBalance > 0 && getCustomerInactivityDays(c) >= 30).length;

  return (
    <div className="min-h-screen pb-24 selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 bg-emerald-600/[0.04] blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
        
        {/* Isolated Merchant Header */}
        <header className="glass-panel rounded-3xl p-4 sm:p-5 border border-white/[0.08] shadow-2xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Store Identity */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/40 border border-emerald-400/30">
                <StoreIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-black text-lg sm:text-xl text-white tracking-tight">
                    {currentStore.name}
                  </h1>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    {currentStore.plan === 'PRO' ? 'باقة PRO' : currentStore.plan === 'ENTERPRISE' ? 'مؤسسات' : 'تجريبي'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  مرحباً بك، {session.user.name} &bull; <span dir="ltr" className="font-mono">{currentStore.phone}</span>
                </p>
              </div>
            </div>

            {/* Header Actions: Daily Closing & Logout */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDailyClosingOpen(true)}
                className="gap-1.5 text-xs text-emerald-300 border-emerald-500/30 bg-emerald-950/30 hover:bg-emerald-900/40"
                title="عرض تقرير وإقفال اليومية"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>تقفيل اليومية</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-xs border-rose-500/20 text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/40"
                title="تسجيل الخروج من المحل"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>خروج</span>
              </Button>
            </div>
          </div>

          {/* Navigation Tabs for this store */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`flex items-center gap-2 text-xs sm:text-sm px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'ledger'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>دفتر حسابات الزبائن والديون</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 text-xs sm:text-sm px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>إعدادات المحل والواتساب</span>
            </button>
          </div>
        </header>

        {/* TAB 1: STORE LEDGER */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            {storeMetrics && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <StatCard
                  title="إجمالي الديون بالخارج"
                  value={storeMetrics.totalDebtOutside}
                  currency={currentStore.currency}
                  variant="debt"
                  subtitle={`موزعة على ${debtorsCount} زبون مدين`}
                  icon={<TrendingDown className="w-5 h-5" />}
                />
                <StatCard
                  title="تم تحصيله اليوم (سداد)"
                  value={storeMetrics.collectedToday}
                  currency={currentStore.currency}
                  variant="payment"
                  subtitle={`${storeMetrics.paymentsTodayCount} عمليات سداد اليوم`}
                  icon={<TrendingUp className="w-5 h-5" />}
                />
                <StatCard
                  title="إجمالي زبائن المحل"
                  value={customers.length}
                  currency="زبون"
                  variant="info"
                  subtitle={`${settledCount} زبون حسابهم خالص ومسدد`}
                  icon={<Users className="w-5 h-5" />}
                />
              </div>
            )}

            {/* Quick Actions & Search Bar */}
            <section className="glass-panel rounded-2xl p-4 border border-white/[0.08] space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                {/* Search */}
                <div className="w-full sm:max-w-md">
                  <Input
                    ref={searchInputRef}
                    placeholder="ابحث باسم الزبون أو الهاتف... (Ctrl + K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search className="w-4 h-4" />}
                    suffix={
                      <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 rounded">
                        Ctrl K
                      </kbd>
                    }
                    className="py-2 text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Filter Chips */}
                  <div className="flex items-center gap-1 p-1 bg-slate-950/70 rounded-xl border border-white/5 flex-wrap">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                        filterType === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'
                      }`}
                    >
                      الكل ({customers.length})
                    </button>
                    <button
                      onClick={() => setFilterType('debtors')}
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                        filterType === 'debtors' ? 'bg-rose-500/20 text-rose-400' : 'text-slate-400'
                      }`}
                    >
                      عليهم ({debtorsCount})
                    </button>
                    <button
                      onClick={() => setFilterType('settled')}
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                        filterType === 'settled' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      خالصين ({settledCount})
                    </button>
                    <button
                      onClick={() => setFilterType('stale')}
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                        filterType === 'stale'
                          ? 'bg-amber-500/25 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-amber-400'
                      }`}
                      title="عرض الزبائن الذين لم يقوموا بأي سداد منذ أكثر من 30 يوماً"
                    >
                      <span>راكدة (+30 يوم)</span>
                      {staleCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/30 text-amber-300 rounded-full font-bold">
                          {staleCount}
                        </span>
                      )}
                    </button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportCustomersToCSV(filteredCustomers, currentStore.name)}
                    className="gap-1.5 shrink-0 text-xs text-slate-300 hover:text-white border-white/10"
                    title="تصدير كشف الديون كملف Excel متوافق مع اللغة العربية"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>تصدير Excel</span>
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsAddCustomerOpen(true)}
                    className="gap-1.5 shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>إضافة زبون</span>
                  </Button>
                </div>
              </div>
            </section>

            {/* Customers Grid */}
            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span>دفتر زبائن {currentStore.name} ({filteredCustomers.length})</span>
                </h2>
                <span className="text-xs text-slate-500">
                  مرتبين تلقائياً حسب الأكثر مديونية
                </span>
              </div>

              {filteredCustomers.length === 0 ? (
                <div className="glass-panel rounded-3xl p-10 text-center space-y-4 border border-white/5">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-400">
                    <Search className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-white">لا توجد نتائج مطابقة</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      لم يتم العثور على أي زبون. يمكنك إضافة زبون جديد في ثوانٍ.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsAddCustomerOpen(true)}
                    className="gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>إضافة زبون جديد الآن</span>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {filteredCustomers.map((customer) => (
                    <CustomerCard
                      key={customer.id}
                      id={customer.id}
                      name={customer.name}
                      phone={customer.phone}
                      address={customer.address}
                      notes={customer.notes}
                      currentBalance={customer.currentBalance}
                      creditLimit={customer.creditLimit}
                      currency={currentStore.currency}
                      storeName={currentStore.name}
                      instapayHandle={currentStore.instapayHandle}
                      vodafoneCash={currentStore.vodafoneCash}
                      daysSinceLastActivity={getCustomerInactivityDays(customer)}
                      onAddDebt={handleOpenDebt}
                      onAddPayment={handleOpenPayment}
                      onViewHistory={handleOpenHistory}
                      onEdit={handleOpenEdit}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 2: STORE SETTINGS */}
        {activeTab === 'settings' && (
          <StoreSettingsView
            store={currentStore}
            onUpdateStore={handleUpdateStore}
            customersCount={customers.length}
          />
        )}

      </main>

      {/* Floating Action Button (Only in Ledger Tab on Desktop/Tablet) */}
      {activeTab === 'ledger' && (
        <div className="hidden sm:block fixed bottom-6 left-6 z-40">
          <Button
            variant="primary"
            size="lg"
            onClick={handleOpenGeneralTx}
            className="rounded-full shadow-2xl shadow-emerald-500/30 gap-2 border border-emerald-400/40 text-sm font-black px-5 py-3 hover:scale-105 transition-transform"
          >
            <Plus className="w-5 h-5" />
            <span>حركة سريعة (+ / -)</span>
          </Button>
        </div>
      )}

      {/* Mobile Taskbar (The Mobile Trio Layout for Phones) */}
      <MobileTaskbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenQuickTx={handleOpenGeneralTx}
        onOpenDailyClosing={() => setIsDailyClosingOpen(true)}
      />

      {/* Modals */}
      <QuickTransactionModal
        isOpen={isQuickTxOpen}
        onClose={() => setIsQuickTxOpen(false)}
        customers={customers}
        preselectedCustomerId={selectedCustomerIdForTx}
        initialType={quickTxType}
        onSubmit={handleTransactionSubmit}
      />

      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onSubmit={handleAddCustomerSubmit}
      />

      <EditCustomerModal
        isOpen={isEditCustomerOpen}
        onClose={() => setIsEditCustomerOpen(false)}
        customer={selectedCustomerForEdit}
        onSave={handleSaveCustomer}
        onDelete={handleDeleteCustomer}
      />

      <CustomerHistoryModal
        isOpen={historyModalState.isOpen}
        onClose={() =>
          setHistoryModalState((prev) => ({ ...prev, isOpen: false }))
        }
        customer={historyModalState.customer}
        transactions={historyModalState.transactions}
        storeName={currentStore.name}
        storePhone={currentStore.phone}
        instapayHandle={currentStore.instapayHandle}
        vodafoneCash={currentStore.vodafoneCash}
      />

      {dailySummary && (
        <DailyClosingModal
          isOpen={isDailyClosingOpen}
          onClose={() => setIsDailyClosingOpen(false)}
          summary={dailySummary}
          storeName={currentStore.name}
          storePhone={currentStore.phone}
          currency={currentStore.currency}
        />
      )}
    </div>
  );
}
