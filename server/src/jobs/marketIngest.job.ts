import cron from 'node-cron';
import { Queue, Worker } from 'bullmq';
import { prisma } from '../services/prisma';
import { getRedis } from '../services/redis';
import { logger } from '../utils/logger';

// Setting up BullMQ queue for market data ingestion
const marketQueue = new Queue('marketIngest', { connection: getRedis() as any });

export async function runMarketIngest() {
  logger.info('Starting nightly market price ingestion job...');

  // Mock data sources replacing an actual Agmarknet scraping or API call
  const crops = ['Tomato', 'Onion', 'Potato', 'Cabbage', 'Brinjal'];
  const locations = [
    { district: 'Bangalore', state: 'Karnataka' },
    { district: 'Mysore', state: 'Karnataka' },
    { district: 'Hubli', state: 'Karnataka' },
    { district: 'Belgaum', state: 'Karnataka' },
  ];

  const now = new Date();
  const newPoints = [];

  for (const loc of locations) {
    for (const cropName of crops) {
      // Find the last known price to base the next day's price off of (random walk)
      const lastPoint = await prisma.pricePoint.findFirst({
        where: { cropName, district: loc.district, state: loc.state },
        orderBy: { observedAt: 'desc' },
      });

      let basePrice = lastPoint?.pricePerKg || (20 + Math.random() * 20); // 20-40 fallback
      let newPrice = basePrice + (Math.random() - 0.5) * 5; // swing +/- 2.5
      newPrice = Math.max(5, newPrice); // minimum 5 Rs

      const point = await prisma.pricePoint.create({
        data: {
          cropName,
          district: loc.district,
          state: loc.state,
          pricePerKg: parseFloat(newPrice.toFixed(2)),
          source: 'AGMARKNET',
          observedAt: now,
        },
      });
      newPoints.push(point);

      // Recompute summaries (last 7 / last 30 days)
      const points30 = await prisma.pricePoint.findMany({
        where: {
          cropName, district: loc.district, state: loc.state,
          observedAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
        },
      });

      const points7 = points30.filter(p => p.observedAt >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
      const avg30 = points30.reduce((acc, p) => acc + p.pricePerKg, 0) / points30.length;
      const avg7 = points7.length > 0 ? points7.reduce((acc, p) => acc + p.pricePerKg, 0) / points7.length : avg30;
      const allPrices = points30.map(p => p.pricePerKg);

      await prisma.priceSummary.upsert({
        where: { cropName_district_state: { cropName, district: loc.district, state: loc.state } },
        update: { avg7d: avg7, avg30d: avg30, minPrice: Math.min(...allPrices), maxPrice: Math.max(...allPrices), lastUpdatedAt: now },
        create: {
          cropName, district: loc.district, state: loc.state,
          avg7d: parseFloat(avg7.toFixed(2)),
          avg30d: parseFloat(avg30.toFixed(2)),
          minPrice: Math.min(...allPrices), maxPrice: Math.max(...allPrices),
        },
      });

      // Clear cache for this crop/location
      await getRedis().del(`summary:${cropName}:${loc.district}:${loc.state}`);
      await getRedis().del(`prices:${cropName}:${loc.district}:${loc.state}:7`);
      await getRedis().del(`prices:${cropName}:${loc.district}:${loc.state}:30`);
    }
  }

  logger.info({ processed: newPoints.length }, 'Nightly market price ingestion completed successfully');
}

// Background Worker
new Worker(
  'marketIngest',
  async (job) => {
    logger.info({ jobId: job.id }, 'Processing market ingest job');
    await runMarketIngest();
  },
  { connection: getRedis() as any }
);

// Schedule to run every night at 2:00 AM
cron.schedule('0 2 * * *', async () => {
  logger.info('Scheduling nightly market ingestion task');
  await marketQueue.add('nightly-ingest', {}, { removeOnComplete: true });
});
