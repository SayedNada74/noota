import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clean() {
  console.log('🧹 جاري مسح كافة البيانات التجريبية والفيك من قاعدة بيانات Supabase...');

  await prisma.transaction.deleteMany({});
  console.log('✔ تم مسح جدول الحركات (Transactions)');

  await prisma.customer.deleteMany({});
  console.log('✔ تم مسح جدول الزبائن (Customers)');

  await prisma.user.deleteMany({});
  console.log('✔ تم مسح جدول المستخدمين (Users)');

  await prisma.store.deleteMany({});
  console.log('✔ تم مسح جدول المحلات (Stores)');

  console.log('✨ قاعدة بيانات Supabase الآن نظيفة تماماً 100% وخالية من أي بيانات فيك!');
}

clean()
  .catch((e) => {
    console.error('خطأ أثناء مسح البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

