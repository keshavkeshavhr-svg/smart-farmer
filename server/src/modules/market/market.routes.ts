import { Router } from 'express';
import { getPrices, getPriceSummary, triggerIngest } from './market.controller';
import { authenticate, authorize } from '../../middleware/auth';

export const marketRouter = Router();

marketRouter.get('/prices', getPrices);
marketRouter.get('/summary', getPriceSummary);
marketRouter.post('/ingest', authenticate, authorize('ADMIN'), triggerIngest);
