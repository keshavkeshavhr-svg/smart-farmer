import { z } from 'zod';

export const createCropSchema = z.object({
  name: z.string().min(1).max(100),
  variety: z.string().optional(),
  grade: z.string().optional(),
  description: z.string().optional(),
  quantityKg: z.coerce.number().positive(),
  pricePerKg: z.coerce.number().positive(),
  minOrderKg: z.coerce.number().positive().default(1),
  locationState: z.string().min(1),
  locationDistrict: z.string().min(1),
  availableFrom: z.coerce.date(),
  availableTo: z.coerce.date(),
});

export const updateCropSchema = createCropSchema.partial().extend({
  status: z.enum(['ACTIVE', 'PAUSED', 'SOLD']).optional(),
});

export const cropQuerySchema = z.object({
  search: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  status: z.enum(['ACTIVE', 'PAUSED', 'SOLD']).optional(),
});
