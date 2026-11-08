import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { enterpriseSecurityHeaders } from './middlewares/security.middleware.js';

// استيراد المسارات
import authRoutes from './modules/auth/auth.routes.js';
import customerRoutes from './modules/customers/customers.routes.js';
import transactionRoutes from './modules/transactions/transactions.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';

const app = express();

// ترويسات الأمان المؤسسية لحماية الخادم
app.use(enterpriseSecurityHeaders);

// Middlewares
app.use(cors({
  origin: '*', // يمكن تقييدها إلى النطاق النهائي في الإنتاج
  credentials: true
}));
app.use(express.json());

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    app: 'Noota API (نوتة رقمية)',
    timestamp: new Date().toISOString()
  });
});

// تفعيل مسارات الـ API
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// معالج الأخطاء العام
app.use(errorHandler);

// تشغيل السيرفر
app.listen(config.port, () => {
  console.log(`🚀 سيرفر نوتة رقمية يعمل بنجاح على المنفذ http://localhost:${config.port}`);
});

export default app;
