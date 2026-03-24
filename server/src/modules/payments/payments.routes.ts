import { Router } from 'express';
import { createUpiPayment, confirmUpiPayment, getGstinInfo } from './payments.controller';
import { authenticate } from '../../middleware/auth';
import rateLimit from 'express-rate-limit';

export const paymentsRouter = Router();

const paymentRateLimiter = rateLimit({ windowMs: 60_000, max: 10 });

paymentsRouter.use(authenticate);
paymentsRouter.post('/upi/create', paymentRateLimiter, createUpiPayment);
paymentsRouter.post('/upi/confirm', paymentRateLimiter, confirmUpiPayment);
paymentsRouter.get('/gstin', getGstinInfo);
