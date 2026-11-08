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

// Health Check (يدعم المسارين /api/health و /health)
const healthHandler = (_req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    status: 'ok',
    app: 'Noota API (نوتة رقمية)',
    timestamp: new Date().toISOString()
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// تفعيل مسارات الـ API (دعم المسارات ببادئة /api وبدونها لضمان التوافق التام)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/customers', customerRoutes);
app.use('/customers', customerRoutes);

app.use('/api/transactions', transactionRoutes);
app.use('/transactions', transactionRoutes);

app.use('/api/dashboard', dashboardRoutes);
app.use('/dashboard', dashboardRoutes);

// معالج الأخطاء العام
app.use(errorHandler);

// تشغيل السيرفر محلياً أو في بيئات السيرفر المستمر (Render / Docker)
if (!process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`🚀 سيرفر نوتة رقمية يعمل بنجاح على المنفذ http://localhost:${config.port}`);
  });
}

export default app;
