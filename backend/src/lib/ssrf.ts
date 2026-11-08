/**
 * وحدة الحماية من هجمات تزوير الطلبات من جانب الخادم (SSRF Defense):
 * مستخلصة من الـ Enterprise Security Blueprint لحظر أي محاولات للوصول
 * إلى الشبكات الداخلية (Private IPs) أو خوادم الميتاداتا السحابية (AWS/GCP/Azure Metadata).
 */

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '::',
  '169.254.169.254', // AWS, Azure, GCP Cloud Metadata IP
  'metadata.google.internal',
  'instance-data'
]);

export function isDisallowedOrPrivateIP(target: string): boolean {
  if (!target) return true;
  const cleaned = target.toLowerCase().trim();

  if (BLOCKED_HOSTNAMES.has(cleaned)) return true;

  // فحص نطاقات الـ IPv4 الخاصة (RFC 1918 & Loopback & Link-local)
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = cleaned.match(ipv4Regex);
  if (match) {
    const o1 = parseInt(match[1], 10);
    const o2 = parseInt(match[2], 10);

    if (o1 === 0 || o1 === 127) return true; // Loopback
    if (o1 === 10) return true; // 10.0.0.0/8 Private
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true; // 172.16.0.0/12 Private
    if (o1 === 192 && o2 === 168) return true; // 192.168.0.0/16 Private
    if (o1 === 169 && o2 === 254) return true; // 169.254.0.0/16 Link-Local / Metadata
    if (o1 >= 224) return true; // Multicast & Reserved
  }

  return false;
}

