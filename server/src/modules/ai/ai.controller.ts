import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../services/prisma';
import { AppError } from '../../middleware/errorHandler';

const predictSchema = z.object({
  cropName: z.string().min(1),
  district: z.string().min(1),
  state: z.string().min(1),
  month: z.coerce.number().int().min(1).max(12),
  recentAvgPrice: z.coerce.number().positive(),
});

export async function predictPrice(req: Request, res: Response, next: NextFunction) {
  try {
    const { cropName, district, state, month, recentAvgPrice } = predictSchema.parse(req.body);

    // This is a stub for an AI microservice (e.g. FastAPI / XGBoost)
    // In production, this would make an HTTP request to the Python ML service
    // For this prototype, we use a simple heuristic "random walk" baseline model

    const summary = await prisma.priceSummary.findUnique({
      where: { cropName_district_state: { cropName, district, state } },
    });

    let basePrice = recentAvgPrice;
    if (summary) {
      // Blend recent input with 30-day historical average
      basePrice = (recentAvgPrice * 0.7) + (summary.avg30d * 0.3);
    }

    // Seasonality factor (mock based on month 1-12)
    const seasonFactor = 1 + Math.sin((month / 12) * Math.PI * 2) * 0.15; // +/- 15% swing

    // District economic factor (mock)
    const isMetro = district.toLowerCase() === 'bangalore';
    const metroFactor = isMetro ? 1.1 : 1.0;

    const predictedMin = basePrice * seasonFactor * metroFactor * 0.9;
    const predictedMax = basePrice * seasonFactor * metroFactor * 1.1;

    // Confidence decreases if we lack historical data
    const confidence = summary ? 0.85 : 0.60;

    res.json({
      cropName,
      district,
      month,
      predictedMin: parseFloat(predictedMin.toFixed(2)),
      predictedMax: parseFloat(predictedMax.toFixed(2)),
      confidence,
      modelId: 'heuristic-v1-stub',
    });
  } catch (err) {
    next(err);
  }
}
