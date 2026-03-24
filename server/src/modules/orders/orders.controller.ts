import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../services/prisma';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';
import { OrderStatus, PaymentStatus } from '@prisma/client';

const createOrderSchema = z.object({
  items: z.array(
    z.discriminatedUnion('type', [
      z.object({ type: z.literal('CROP'), cropId: z.string(), quantityKg: z.number().positive() }).passthrough(),
      z.object({ type: z.literal('STORE'), productId: z.string(), quantity: z.number().int().positive() }).passthrough(),
    ])
  ).min(1),
  shippingAddress: z.object({
    line1: z.string().min(1),
    district: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().regex(/^\d{6}$/),
  }),
  shippingLat: z.number().optional(),
  shippingLng: z.number().optional(),
  notes: z.string().optional(),
});

export async function createOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { items, shippingAddress, notes, shippingLat, shippingLng } = createOrderSchema.parse(req.body);
    let totalAmount = 0;
    let farmerId = '';
    const orderItemsData: any[] = [];

    for (const item of items) {
      if (item.type === 'CROP') {
        const crop = await prisma.crop.findUnique({ where: { id: item.cropId } });
        if (!crop || crop.status !== 'ACTIVE') throw new AppError(400, 'VALIDATION_ERROR', `Crop ${item.cropId} not available`);
        if (item.quantityKg < crop.minOrderKg) throw new AppError(400, 'VALIDATION_ERROR', `Minimum order is ${crop.minOrderKg}kg`);
        farmerId = crop.farmerId;
        const itemTotal = crop.pricePerKg * item.quantityKg;
        totalAmount += itemTotal;
        orderItemsData.push({ type: 'CROP', cropId: crop.id, quantityKg: item.quantityKg, unitPrice: crop.pricePerKg, totalPrice: itemTotal });
      } else {
        const product = await prisma.storeProduct.findUnique({ where: { id: item.productId } });
        if (!product || !product.isActive) throw new AppError(400, 'VALIDATION_ERROR', `Product ${item.productId} not available`);
        if (product.stock < item.quantity) throw new AppError(400, 'VALIDATION_ERROR', `Insufficient stock for ${product.name}`);
        // For store orders, use a system farmer (admin)
        if (!farmerId) farmerId = req.user!.id;
        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;
        orderItemsData.push({ type: 'STORE', productId: product.id, quantityUnits: item.quantity, unitPrice: product.price, totalPrice: itemTotal });
      }
    }

    const order = await prisma.order.create({
      data: {
        buyerId: req.user!.id,
        farmerId,
        totalAmount,
        shippingAddressLine1: shippingAddress.line1,
        shippingDistrict: shippingAddress.district,
        shippingState: shippingAddress.state,
        shippingPincode: shippingAddress.pincode,
        shippingLat: shippingLat ?? null,
        shippingLng: shippingLng ?? null,
        notes,
        items: { create: orderItemsData },
        deliveryEvents: { create: [{ eventType: 'CONFIRMED', note: 'Order placed successfully' }] },
      },
      include: { items: true, deliveryEvents: true },
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

export async function getOrders(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '10');
    const skip = (page - 1) * limit;

    const where: any = user.role === 'ADMIN' ? {} :
      user.role === 'FARMER' ? { farmerId: user.id } :
      { buyerId: user.id };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { crop: { select: { name: true, images: true } }, product: { select: { name: true, images: true } } } },
          buyer: { select: { name: true, email: true, phone: true, geoLat: true, geoLng: true, address: true } },
          farmer: { select: { name: true, email: true, phone: true } },
          deliveryEvents: { orderBy: { timestamp: 'asc' } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ data: orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: { include: { crop: true, product: true } },
        buyer: { select: { name: true, email: true, phone: true, geoLat: true, geoLng: true, address: true } },
        farmer: { select: { name: true, email: true, phone: true } },
        deliveryEvents: { orderBy: { timestamp: 'asc' } },
      },
    });
    if (!order) throw new AppError(404, 'NOT_FOUND', 'Order not found');

    const user = req.user!;
    const canAccess = user.role === 'ADMIN' || order.buyerId === user.id || order.farmerId === user.id;
    if (!canAccess) throw new AppError(403, 'FORBIDDEN', 'Access denied');

    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status, note } = z.object({
      status: z.nativeEnum(OrderStatus),
      note: z.string().optional(),
    }).parse(req.body);

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) throw new AppError(404, 'NOT_FOUND', 'Order not found');

    const user = req.user!;
    const canUpdate = user.role === 'ADMIN' || order.farmerId === user.id;
    if (!canUpdate) throw new AppError(403, 'FORBIDDEN', 'Only farmer or admin can update order status');

    const [updated] = await prisma.$transaction([
      prisma.order.update({ where: { id: req.params.id }, data: { status } }),
      prisma.deliveryEvent.create({ data: { orderId: req.params.id, eventType: status as any, note } }),
    ]);

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function updateDriverLocation(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { lat, lng } = z.object({
      lat: z.number(),
      lng: z.number(),
    }).parse(req.body);

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) throw new AppError(404, 'NOT_FOUND', 'Order not found');

    const user = req.user!;
    const canUpdate = user.role === 'ADMIN' || order.farmerId === user.id;
    if (!canUpdate) throw new AppError(403, 'FORBIDDEN', 'Only farmer or admin can update driver location');

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { driverLat: lat, driverLng: lng },
    });

    res.json({ driverLat: updated.driverLat, driverLng: updated.driverLng });
  } catch (err) {
    next(err);
  }
}
