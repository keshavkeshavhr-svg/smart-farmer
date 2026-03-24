import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../services/prisma';
import { AppError } from '../../middleware/errorHandler';
import { config } from '../../config';
import { registerSchema, loginSchema } from './auth.schema';
import { Role } from '@prisma/client';

function signToken(user: { id: string; role: Role; email: string; name: string }) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as any }
  );
}

function setCookie(res: Response, token: string) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: data.email, mode: 'insensitive' } },
          { phone: data.phone }
        ]
      },
    });
    if (existing) {
      throw new AppError(409, 'CONFLICT', 'Email or phone already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        role: data.role as Role,
        name: data.name,
        phone: data.phone,
        email: data.email,
        passwordHash,
        address: data.address,
        district: data.district,
        state: data.state,
        pincode: data.pincode,
        ...(data.role === 'FARMER' ? {
          farmerProfile: { create: { farmName: data.farmName || `${data.name}'s Farm` } },
        } : {
          buyerProfile: { create: { company: data.company } },
        }),
      },
      include: { farmerProfile: true, buyerProfile: true },
    });

    const token = signToken(user);
    setCookie(res, token);

    res.status(201).json({
      user: {
        id: user.id, role: user.role, name: user.name,
        email: user.email, phone: user.phone,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { emailOrPhone, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: emailOrPhone, mode: 'insensitive' } },
          { phone: emailOrPhone },
        ],
      },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid credentials');
    }

    if (!user.isActive) {
      throw new AppError(403, 'FORBIDDEN', 'Account suspended. Contact support.');
    }

    const token = signToken(user);
    setCookie(res, token);

    res.json({
      user: { id: user.id, role: user.role, name: user.name, email: user.email, phone: user.phone },
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as any;
    const user = await prisma.user.findUnique({
      where: { id: authReq.user.id },
      select: {
        id: true, role: true, name: true, email: true, phone: true,
        district: true, state: true, pincode: true, geoLat: true, geoLng: true,
        isActive: true, kycStatus: true, createdAt: true,
        farmerProfile: { select: { farmName: true, rating: true, certification: true } },
        buyerProfile: { select: { company: true, gstin: true } },
      },
    });
    if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
    res.json(user);
  } catch (err) {
    next(err);
  }
}
