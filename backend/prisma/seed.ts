import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 جاري زراعة البيانات الأولية لقاعدة بيانات نوتة رقمية على Supabase...');

  const passwordHash = await bcrypt.hash('123456', 10);

  // 1. المحل الأول: سوبر ماركت الأمل
  const store1 = await prisma.store.upsert({
    where: { phone: '01012345678' },
    update: {},
    create: {
      name: 'سوبر ماركت الأمل',
      phone: '01012345678',
      category: 'supermarket',
      address: 'شارع الجمهورية، المنصورة',
      currency: 'ج.م',
      plan: 'PRO',
      whatsappTemplate: 'السلام عليكم أستاذ {customer_name}، نود تذكيرك بأن لديك حساب متبقي بقيمة {balance} {currency} لدى ({store_name}).',
      users: {
        create: {
          name: 'أحمد صاحب الأمل',
          phone: '01012345678',
          passwordHash,
          role: 'OWNER'
        }
      }
    }
  });

  const user1 = await prisma.user.findFirst({ where: { storeId: store1.id } });

  // زبائن سوبر ماركت الأمل
  const cust1 = await prisma.customer.upsert({
    where: { storeId_phone: { storeId: store1.id, phone: '01011112222' } },
    update: {},
    create: {
      storeId: store1.id,
      name: 'أحمد محمود السقا',
      phone: '01011112222',
      address: 'عمارة 12، الدور الثاني',
      notes: 'زبون قديم وموثوق، يسدد أول كل شهر',
      currentBalance: 420.00,
      creditLimit: 500.00
    }
  });

  const cust2 = await prisma.customer.upsert({
    where: { storeId_phone: { storeId: store1.id, phone: '01122223333' } },
    update: {},
    create: {
      storeId: store1.id,
      name: 'عم إبراهيم النجار',
      phone: '01122223333',
      address: 'الورشة بجوار المسجد',
      notes: 'طلبات شاي وسكر أسبوعية للورشة',
      currentBalance: 185.50,
      creditLimit: 200.00
    }
  });

  if (user1) {
    // حركات تجريبية
    await prisma.transaction.create({
      data: {
        storeId: store1.id,
        customerId: cust1.id,
        createdById: user1.id,
        type: 'DEBT',
        amount: 120.00,
        balanceAfter: 420.00,
        note: 'زيت وسكر وأرز'
      }
    });

    await prisma.transaction.create({
      data: {
        storeId: store1.id,
        customerId: cust1.id,
        createdById: user1.id,
        type: 'PAYMENT',
        amount: 200.00,
        balanceAfter: 300.00,
        note: 'سداد جزء من الحساب مع المرتب'
      }
    });
  }

  // 2. المحل الثاني: صيدلية د. رشا الحديثة
  const store2 = await prisma.store.upsert({
    where: { phone: '01234567890' },
    update: {},
    create: {
      name: 'صيدلية د. رشا الحديثة',
      phone: '01234567890',
      category: 'pharmacy',
      address: 'ميدان الثورة، المحلة الكبرى',
      currency: 'ج.م',
      plan: 'ENTERPRISE',
      whatsappTemplate: 'أهلاً بك أستاذ {customer_name}، نحيطك علماً بأن الرصيد الآجل المتبقي لصالح ({store_name}) هو {balance} {currency}. نتمنى لكم دوام الصحة والعافية.',
      users: {
        create: {
          name: 'د. رشا',
          phone: '01234567890',
          passwordHash,
          role: 'OWNER'
        }
      }
    }
  });

  await prisma.customer.upsert({
    where: { storeId_phone: { storeId: store2.id, phone: '01299998888' } },
    update: {},
    create: {
      storeId: store2.id,
      name: 'الحاجة أم أحمد',
      phone: '01299998888',
      address: 'شارع المستشفى',
      notes: 'علاج شهري للسكر والضغط',
      currentBalance: 850.00,
      creditLimit: 750.00
    }
  });

  console.log('✅ تم زراعة البيانات الأولية بنجاح على قاعدة البيانات!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

