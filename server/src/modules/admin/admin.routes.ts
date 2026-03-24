import { Router } from 'express';
import { getUsers, toggleUserStatus, getPlatformMetrics } from './admin.controller';
import { authenticate, authorize } from '../../middleware/auth';

export const adminRouter = Router();

adminRouter.use(authenticate, authorize('ADMIN'));
adminRouter.get('/users', getUsers);
adminRouter.patch('/users/:id/status', toggleUserStatus);
adminRouter.get('/metrics', getPlatformMetrics);
