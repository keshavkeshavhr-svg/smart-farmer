import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../services/prisma';
import { AppError } from '../../middleware/errorHandler';
import { createCropSchema, updateCropSchema, cropQuerySchema } from './crops.schema';
import { AuthRequest } from '../../middleware/auth';
import { CropStatus } from '@prisma/client';

export async function getCrops(req: Request, res: Response, next: NextFunction) {
  try {
    const query = cropQuerySchema.parse(req.query);
    const { search, district, state, minPrice, maxPrice, page, limit, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      status: status ?? CropStatus.ACTIVE,
      ...(district && { locationDistrict: { contains: district, mode: 'insensitive' } }),
      ...(state && { locationState: { contains: state, mode: 'insensitive' } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { variety: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...((minPrice || maxPrice) && {
        pricePerKg: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        },
      }),
    };

    const [crops, total] = await Promise.all([
      prisma.crop.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          farmer: {
            select: { id: true, name: true, district: true, state: true, farmerProfile: { select: { farmName: true, rating: true } } },
          },
        },
      }),
      prisma.crop.count({ where }),
    ]);

    res.json({
      data: crops,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getCropById(req: Request, res: Response, next: NextFunction) {
  try {
    const crop = await prisma.crop.findUnique({
      where: { id: req.params.id },
      include: {
        farmer: {
          select: {
            id: true, name: true, district: true, state: true, geoLat: true, geoLng: true,
            farmerProfile: { select: { farmName: true, rating: true, totalRatings: true, certification: true } },
          },
        },
      },
    });
    if (!crop) throw new AppError(404, 'NOT_FOUND', 'Crop not found');
    res.json(crop);
  } catch (err) {
    next(err);
  }
}

export async function createCrop(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createCropSchema.parse(req.body);
    const images = (req.files as Express.Multer.File[])?.map(f => `/uploads/${f.filename}`) || [];

    const crop = await prisma.crop.create({
      data: {
        ...data,
        farmerId: req.user!.id,
        images,
      },
    });
    res.status(201).json(crop);
  } catch (err) {
    next(err);
  }
}

export async function updateCrop(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const crop = await prisma.crop.findUnique({ where: { id: req.params.id } });
    if (!crop) throw new AppError(404, 'NOT_FOUND', 'Crop not found');

    const isFarmerOwner = req.user!.role === 'FARMER' && crop.farmerId === req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';
    if (!isFarmerOwner && !isAdmin) throw new AppError(403, 'FORBIDDEN', 'Access denied');

    const data = updateCropSchema.parse(req.body);
    const updated = await prisma.crop.update({ where: { id: req.params.id }, data });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteCrop(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const crop = await prisma.crop.findUnique({ where: { id: req.params.id } });
    if (!crop) throw new AppError(404, 'NOT_FOUND', 'Crop not found');

    const isFarmerOwner = req.user!.role === 'FARMER' && crop.farmerId === req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';
    if (!isFarmerOwner && !isAdmin) throw new AppError(403, 'FORBIDDEN', 'Access denied');

    await prisma.crop.delete({ where: { id: req.params.id } });
    res.json({ message: 'Crop deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getMycrops(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const crops = await prisma.crop.findMany({
      where: { farmerId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(crops);
  } catch (err) {
    next(err);
  }
}
