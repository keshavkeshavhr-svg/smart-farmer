import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../services/prisma';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';
import { StoreCategory } from '@prisma/client';

const productQuerySchema = z.object({
  category: z.preprocess((val) => (val === '' ? undefined : val), z.nativeEnum(StoreCategory).optional()),
  brand: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
});

const createProductSchema = z.object({
  name: z.string().min(1),
  category: z.nativeEnum(StoreCategory),
  brand: z.string().optional(),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  description: z.string().optional(),
  attributes: z.record(z.any()).optional(),
});

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, brand, search, page, limit } = productQuerySchema.parse(req.query);
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
      ...(category && { category }),
      ...(brand && { brand: { contains: brand, mode: 'insensitive' } }),
      ...(search && { OR: [{ name: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }] }),
    };

    const [products, total] = await Promise.all([
      prisma.storeProduct.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.storeProduct.count({ where }),
    ]);

    res.json({ data: products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
}

export async function getProductById(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await prisma.storeProduct.findUnique({ where: { id: req.params.id } });
    if (!product) throw new AppError(404, 'NOT_FOUND', 'Product not found');
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createProductSchema.parse(req.body);
    const images = (req.files as Express.Multer.File[])?.map(f => `/uploads/${f.filename}`) || [];
    const product = await prisma.storeProduct.create({ data: { ...data, images } });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createProductSchema.partial().parse(req.body);
    const product = await prisma.storeProduct.update({ where: { id: req.params.id }, data });
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.storeProduct.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: 'Product deactivated' });
  } catch (err) {
    next(err);
  }
}
