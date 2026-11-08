import { prisma } from '../../lib/prisma.js';

export class CustomerService {
  static async listCustomers(storeId: string, search?: string) {
    return prisma.customer.findMany({
      where: {
        storeId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } }
              ]
            }
          : {})
      },
      orderBy: {
        currentBalance: 'desc' // إظهار أكثر الزبائن مديونية في البداية لتسهيل المتابعة
      },
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        notes: true,
        currentBalance: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { transactions: true }
        }
      }
    });
  }

  static async getCustomerById(storeId: string, customerId: string) {
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        storeId // حماية العزل: لا يمكن الوصول لعميل لا يخص هذا المحل
      },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            createdBy: {
              select: { name: true }
            }
          }
        }
      }
    });

    if (!customer) {
      throw new Error('الزبون غير موجود أو لا يتبع هذا المحل');
    }

    return customer;
  }

  static async createCustomer(
    storeId: string,
    data: { name: string; phone?: string; address?: string; notes?: string; initialDebt?: number }
  ) {
    // التحقق من تكرار الهاتف لنفس المحل إذا تم إدخال هاتف
    if (data.phone) {
      const existing = await prisma.customer.findFirst({
        where: { storeId, phone: data.phone }
      });
      if (existing) {
        throw new Error('يوجد زبون مسجل مسبقاً بنفس رقم الهاتف في هذا المحل');
      }
    }

    const initialDebt = data.initialDebt && data.initialDebt > 0 ? data.initialDebt : 0;

    return prisma.customer.create({
      data: {
        storeId,
        name: data.name,
        phone: data.phone || null,
        address: data.address || null,
        notes: data.notes || null,
        currentBalance: initialDebt
      }
    });
  }

  static async updateCustomer(
    storeId: string,
    customerId: string,
    data: { name?: string; phone?: string; address?: string; notes?: string }
  ) {
    // التأكد من الملكية أولاً
    const existing = await prisma.customer.findFirst({
      where: { id: customerId, storeId }
    });

    if (!existing) {
      throw new Error('الزبون غير موجود');
    }

    return prisma.customer.update({
      where: { id: customerId },
      data: {
        name: data.name ?? existing.name,
        phone: data.phone ?? existing.phone,
        address: data.address ?? existing.address,
        notes: data.notes ?? existing.notes
      }
    });
  }

  static async deleteCustomer(storeId: string, customerId: string) {
    const existing = await prisma.customer.findFirst({
      where: { id: customerId, storeId }
    });

    if (!existing) {
      throw new Error('الزبون غير موجود');
    }

    return prisma.customer.delete({
      where: { id: customerId }
    });
  }
}

