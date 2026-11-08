import { prisma } from '../../lib/prisma.js';

export class DashboardService {
  static async getMetrics(storeId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      customersStats,
      collectedTodayAgg,
      debtAddedTodayAgg,
      recentTransactions
    ] = await Promise.all([
      // إجمالي الديون المستحقة بالخارج وعدد المدينين
      prisma.customer.aggregate({
        where: {
          storeId,
          currentBalance: { gt: 0 }
        },
        _sum: { currentBalance: true },
        _count: { id: true }
      }),

      // إجمالي ما تم تحصيله اليوم (سداد)
      prisma.transaction.aggregate({
        where: {
          storeId,
          type: 'PAYMENT',
          createdAt: { gte: todayStart }
        },
        _sum: { amount: true },
        _count: { id: true }
      }),

      // إجمالي الديون المضافة اليوم
      prisma.transaction.aggregate({
        where: {
          storeId,
          type: 'DEBT',
          createdAt: { gte: todayStart }
        },
        _sum: { amount: true },
        _count: { id: true }
      }),

      // آخر 5 حركات لعرضها في الشاشة الرئيسية
      prisma.transaction.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          customer: {
            select: { id: true, name: true, phone: true }
          }
        }
      })
    ]);

    const totalCustomersCount = await prisma.customer.count({
      where: { storeId }
    });

    return {
      totalDebtOutside: Number(customersStats._sum.currentBalance || 0),
      debtorsCount: customersStats._count.id || 0,
      totalCustomers: totalCustomersCount,
      collectedToday: Number(collectedTodayAgg._sum.amount || 0),
      paymentsTodayCount: collectedTodayAgg._count.id || 0,
      debtAddedToday: Number(debtAddedTodayAgg._sum.amount || 0),
      debtsTodayCount: debtAddedTodayAgg._count.id || 0,
      recentTransactions
    };
  }
}

