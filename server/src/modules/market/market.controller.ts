import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../services/prisma';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';
import { cacheGet, cacheSet } from '../../services/redis';
import { PriceSource } from '@prisma/client';

const priceQuerySchema = z.object({
  cropName: z.string().min(1),
  district: z.string().optional(),
  state: z.string().optional(),
  range: z.enum(['7', '30']).default('7'),
});

export async function getPrices(req: Request, res: Response, next: NextFunction) {
  try {
    const { cropName, district, state, range } = priceQuerySchema.parse(req.query);
    const days = parseInt(range);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const cacheKey = `prices:${cropName}:${district}:${state}:${range}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const where: any = {
      cropName: { equals: cropName, mode: 'insensitive' },
      observedAt: { gte: since },
      ...(district && { district: { equals: district, mode: 'insensitive' } }),
      ...(state && { state: { equals: state, mode: 'insensitive' } }),
    };

    const points = await prisma.pricePoint.findMany({
      where,
      orderBy: { observedAt: 'asc' },
    });

    const result = { cropName, district, state, range: `${days}d`, data: points };
    await cacheSet(cacheKey, result, 300);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getPriceSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const cropName = req.query.cropName as string;
    const district = req.query.district as string;
    const state = req.query.state as string;
    if (!cropName) throw new AppError(400, 'VALIDATION_ERROR', 'cropName is required');

    const cacheKey = `summary:${cropName}:${district}:${state}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const where: any = {
      cropName: { equals: cropName, mode: 'insensitive' },
      ...(district && { district: { equals: district, mode: 'insensitive' } }),
      ...(state && { state: { equals: state, mode: 'insensitive' } }),
    };

    const summaries = await prisma.priceSummary.findMany({ where, take: 10 });
    await cacheSet(cacheKey, summaries, 300);
    res.json(summaries);
  } catch (err) {
    next(err);
  }
}

export async function triggerIngest(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Run ingest inline for simplicity (BullMQ would be used in production)
    const { runMarketIngest } = await import('../../jobs/marketIngest.job');
    await runMarketIngest();
    res.json({ message: 'Market price ingestion triggered successfully' });
  } catch (err) {
    next(err);
  }
}
