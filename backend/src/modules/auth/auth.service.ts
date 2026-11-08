import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';
import { config } from '../../config/index.js';

export class AuthService {
  static async registerStoreWithOwner(data: {
    storeName: string;
    ownerName: string;
    phone: string;
    password: string;
    address?: string;
  }) {
    // التحقق من عدم وجود رقم الهاتف مسبقاً
    const existingUser = await prisma.user.findUnique({
      where: { phone: data.phone }
    });

    if (existingUser) {
      throw new Error('رقم الهاتف مسجل بالفعل مسبقاً في النظام');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    // إنشاء المحل وصاحب المحل في عملية واحدة ذرية (Atomic Transaction)
    const result = await prisma.$transaction(async (tx) => {
      const store = await tx.store.create({
        data: {
          name: data.storeName,
          phone: data.phone,
          address: data.address
        }
      });

      const user = await tx.user.create({
        data: {
          name: data.ownerName,
          phone: data.phone,
          passwordHash,
          role: 'OWNER',
          storeId: store.id
        }
      });

      return { store, user };
    });

    const token = jwt.sign(
      {
        userId: result.user.id,
        storeId: result.store.id,
        role: result.user.role
      },
      config.jwtSecret,
      { algorithm: 'HS256', expiresIn: '30d' }
    );

    return {
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        phone: result.user.phone,
        role: result.user.role
      },
      store: {
        id: result.store.id,
        name: result.store.name,
        currency: result.store.currency
      }
    };
  }

  static async login(phone: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { store: true }
    });

    if (!user) {
      throw new Error('رقم الهاتف أو كلمة السر غير صحيحة');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('رقم الهاتف أو كلمة السر غير صحيحة');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        storeId: user.storeId,
        role: user.role
      },
      config.jwtSecret,
      { algorithm: 'HS256', expiresIn: '30d' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role
      },
      store: {
        id: user.store.id,
        name: user.store.name,
        currency: user.store.currency,
        whatsappTemplate: user.store.whatsappTemplate,
        instapayHandle: (user.store as any).instapayHandle,
        vodafoneCash: (user.store as any).vodafoneCash
      }
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            currency: true,
            whatsappTemplate: true,
            instapayHandle: true,
            vodafoneCash: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      store: user.store
    };
  }
}

