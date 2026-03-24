import { Router } from 'express';
import { predictPrice } from './ai.controller';

export const aiRouter = Router();

aiRouter.post('/price-predict', predictPrice);
