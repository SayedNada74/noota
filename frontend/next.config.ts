import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false, // إخفاء هوية الخادم لحمايته من الاستهداف
  compress: true, // ضغط الملفات بتقنية Gzip / Brotli

  // تكوين Turbopack لمعالجة Tailwind CSS v4
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  // تحسين استيراد الحزم وتقليل حجم حزم الـ JavaScript
  experimental: {
    optimizePackageImports: ["lucide-react", "clsx", "tailwind-merge"],
  },

  // ترويسات الأمان الصارمة المعتمدة في الـ Enterprise Security Blueprint
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      ],
    },
    {
      // تخزين الملفات الثابتة لعام كامل
      source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    {
      // ملف تعريف تطبيق الويب PWA
      source: "/manifest.json",
      headers: [
        { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
      ],
    },
  ],
};

export default nextConfig;
