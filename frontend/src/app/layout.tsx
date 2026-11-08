import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap"
});

export const metadata: Metadata = {
  title: "نوتة رقمية (Noota) | دفتر الشكك وإدارة الديون الذكي للمحلات",
  description: "نظام دفتر رقمي سحابي لأصحاب المحلات، السوبرماركت، والأكشاك لتتبع ديون الزبائن والتحصيل السريع عبر الواتساب بدقة وسرعة وبدون إحراج.",
  applicationName: "نوتة رقمية",
  appleWebApp: {
    capable: true,
    title: "نوتة رقمية",
    statusBarStyle: "black-translucent"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#080C14"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} dark`}>
      <body className="min-h-screen bg-[#080C14] text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
