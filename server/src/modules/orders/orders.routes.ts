import { Router } from 'express';
import { createOrder, getOrders, getOrderById, updateOrderStatus, updateDriverLocation } from './orders.controller';
import { authenticate, authorize } from '../../middleware/auth';

export const ordersRouter = Router();

ordersRouter.use(authenticate);
ordersRouter.post('/', authorize('BUYER', 'FARMER'), createOrder);
ordersRouter.get('/', getOrders);
ordersRouter.get('/:id', getOrderById);
ordersRouter.patch('/:id/status', updateOrderStatus);
ordersRouter.patch('/:id/location', updateDriverLocation);
