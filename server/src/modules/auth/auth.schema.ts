import { z } from 'zod';

export const registerSchema = z.object({
  role: z.enum(['FARMER', 'BUYER']),
  name: z.string().min(2).max(100),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and a number'),
  address: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
  farmName: z.string().optional(), // for farmers
  company: z.string().optional(), // for buyers
});

export const loginSchema = z.object({
  emailOrPhone: z.string().trim().toLowerCase().min(1),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
