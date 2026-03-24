import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { globalRateLimiter } from './middleware/rateLimiter';
import { authRouter } from './modules/auth/auth.routes';
import { cropsRouter } from './modules/crops/crops.routes';
import { ordersRouter } from './modules/orders/orders.routes';
import { paymentsRouter } from './modules/payments/payments.routes';
import { storeRouter } from './modules/store/store.routes';
import { marketRouter } from './modules/market/market.routes';
import { weatherRouter } from './modules/weather/weather.routes';
import { aiRouter } from './modules/ai/ai.routes';
import { adminRouter } from './modules/admin/admin.routes';
import { uploadsRouter } from './modules/uploads/uploads.routes';

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Core Middleware ───────────────────────────────────────────────────────────
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));
app.use(globalRateLimiter);

// ─── Static Files ──────────────────────────────────────────────────────────────
app.use('/uploads', express.static('uploads'));

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'smart-farmer-api' });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/crops', cropsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/store', storeRouter);
app.use('/api/market', marketRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/ai', aiRouter);
app.use('/api/admin', adminRouter);
app.use('/api/uploads', uploadsRouter);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  logger.info(`🚀 Smart Farmer API running on http://localhost:${config.port}`);
  logger.info(`📊 Environment: ${config.nodeEnv}`);
});

export default app;
