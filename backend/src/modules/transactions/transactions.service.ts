import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

export class TransactionService {
  static async recordTransaction(params: {
    storeId: string;
    userId: string;
    customerId: string;
    type: 'DEBT' | 'PAYMENT';
    amount: number;
    note?: string;
  }) {
    const { storeId, userId, customerId, type, amount, note } = params;

    if (amount <= 0) {
      throw new Error('يجب أن تكون قيمة المبلغ أكبر من صفر');
    }

    // تنفيذ الحركة وتحديث الرصيد داخل معاملة ذرية تضمن عدم ضياع أو تضارب أي مليم
    return prisma.$transaction(async (tx) => {
      // 1. التحقق من وجود العميل وتبعيته لنفس المحل
      const customer = await tx.customer.findFirst({
        where: { id: customerId, storeId }
      });

      if (!customer) {
        throw new Error('الزبون غير موجود أو لا يتبع هذا المحل');
      }

      const currentBalanceNumber = Number(customer.currentBalance);
      let newBalanceNumber = currentBalanceNumber;

      if (type === 'DEBT') {
        // أخذ بضاعة على الحساب: يزداد الدين
        newBalanceNumber = currentBalanceNumber + amount;
      } else if (type === 'PAYMENT') {
        // سداد دفعة: ينقص الدين
        newBalanceNumber = currentBalanceNumber - amount;
      }

      const balanceAfter = new Prisma.Decimal(newBalanceNumber);

      // 2. إنشاء سجل الحركة في دفتر الأستاذ (Ledger)
      const transaction = await tx.transaction.create({
        data: {
          storeId,
          customerId,
          createdById: userId,
          type,
          amount: new Prisma.Decimal(amount),
          balanceAfter,
          note: note || null
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          },
          createdBy: {
            select: {
              name: true
            }
          }
        }
      });

      // 3. تحديث الرصيد المحفوظ على العميل
      await tx.customer.update({
        where: { id: customerId },
        data: {
          currentBalance: balanceAfter
        }
      });

      return {
        transaction,
        customerNewBalance: newBalanceNumber
      };
    });
  }

  static async listRecentTransactions(storeId: string, limit = 20) {
    return prisma.transaction.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        customer: {
          select: { id: true, name: true, phone: true }
        },
        createdBy: {
          select: { name: true }
        }
      }
    });
  }

  static async getCustomerLedger(storeId: string, customerId: string) {
    // التحقق من التبعية أولاً
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, storeId }
    });

    if (!customer) {
      throw new Error('الزبون غير موجود');
    }

    const transactions = await prisma.transaction.findMany({
      where: { storeId, customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { name: true }
        }
      }
    });

    return {
      customer,
      transactions
    };
  }
}

