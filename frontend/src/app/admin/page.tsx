import { notFound } from 'next/navigation';

export default function FakeAdminPage() {
  // إرجاع خطأ 404 صريح لمنع أي شخص يكتب /admin من معرفة أي شيء
  notFound();
}

