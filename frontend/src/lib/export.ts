import { Customer } from './types';

export function exportCustomersToCSV(customers: Customer[], storeName: string) {
  // إضافة BOM لضمان قراءة الحروف العربية بشكل سليم داخل برنامج Microsoft Excel
  const BOM = '\uFEFF';
  const headers = ['اسم الزبون', 'رقم الهاتف', 'العنوان', 'الرصيد المتبقي (ج.م)', 'الحد الائتماني', 'الملاحظات'];

  const rows = customers.map((c) => [
    `"${c.name.replace(/"/g, '""')}"`,
    `"${(c.phone || '').replace(/"/g, '""')}"`,
    `"${(c.address || '').replace(/"/g, '""')}"`,
    c.currentBalance,
    c.creditLimit || 'بدون حد',
    `"${(c.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = BOM + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `كشف_ديون_${storeName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

