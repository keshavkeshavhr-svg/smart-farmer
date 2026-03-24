import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../services/prisma';

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { role, search, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { phone: { contains: search as string, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, email: true, phone: true, role: true,
          isActive: true, kycStatus: true, createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ data: users, pagination: { page: parseInt(page as string), limit: parseInt(limit as string), total } });
  } catch (err) {
    next(err);
  }
}

export async function toggleUserStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { isActive } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive },
      select: { id: true, email: true, isActive: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function getPlatformMetrics(req: Request, res: Response, next: NextFunction) {
  try {
    const [
      totalUsers,
      totalFarmers,
      totalBuyers,
      totalOrders,
      totalRevenue,
      activeListings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'FARMER' } }),
      prisma.user.count({ where: { role: 'BUYER' } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { not: 'CANCELLED' } } }),
      prisma.crop.count({ where: { status: 'ACTIVE' } }),
    ]);

    // GMV by month for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentOrders = await prisma.order.findMany({
      where: { createdAt: { gte: sixMonthsAgo }, status: { not: 'CANCELLED' } },
      select: { totalAmount: true, createdAt: true },
    });

    const gmvByMonth = recentOrders.reduce((acc, order) => {
      const month = order.createdAt.toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + order.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      metrics: {
        totalUsers, totalFarmers, totalBuyers,
        totalOrders, gmv: totalRevenue._sum.totalAmount || 0,
        activeListings,
      },
      charts: {
        gmvOverTime: Object.entries(gmvByMonth).map(([month, amount]) => ({ month, amount })).sort((a, b) => a.month.localeCompare(b.month)),
      },
    });
  } catch (err) {
    next(err);
  }
}
