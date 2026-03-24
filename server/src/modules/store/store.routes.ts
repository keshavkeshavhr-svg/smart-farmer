import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from './store.controller';
import { authenticate, authorize } from '../../middleware/auth';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

export const storeRouter = Router();

storeRouter.get('/products', getProducts);
storeRouter.get('/products/:id', getProductById);
storeRouter.post('/products', authenticate, authorize('ADMIN'), upload.array('images', 5), createProduct);
storeRouter.patch('/products/:id', authenticate, authorize('ADMIN'), updateProduct);
storeRouter.delete('/products/:id', authenticate, authorize('ADMIN'), deleteProduct);
